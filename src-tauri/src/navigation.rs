use std::collections::{hash_map::DefaultHasher, HashSet};
use std::hash::{Hash, Hasher};
use url::Url;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NavigationDecision {
    AllowInApp,
    OpenExternal,
    Block,
}

fn same_origin(left: &Url, right: &Url) -> bool {
    left.scheme() == right.scheme()
        && left.host_str() == right.host_str()
        && left.port_or_known_default() == right.port_or_known_default()
}

fn is_supabase_oauth_authorize(url: &Url, supabase_origin: &Url) -> bool {
    same_origin(url, supabase_origin) && url.path() == "/auth/v1/authorize"
}

pub fn classify_navigation(
    url: &Url,
    app_origin: &Url,
    supabase_origin: &Url,
) -> NavigationDecision {
    if same_origin(url, app_origin) {
        if url
            .query_pairs()
            .any(|(key, value)| key == "desktop-browser" && value == "1")
        {
            return NavigationDecision::OpenExternal;
        }
        return NavigationDecision::AllowInApp;
    }

    if same_origin(url, supabase_origin) {
        return if is_supabase_oauth_authorize(url, supabase_origin) {
            NavigationDecision::OpenExternal
        } else {
            NavigationDecision::Block
        };
    }

    if url.scheme() == "https" {
        NavigationDecision::OpenExternal
    } else {
        NavigationDecision::Block
    }
}

pub fn parse_oauth_callback(url: &Url) -> Result<String, &'static str> {
    if url.scheme() != "scisiam"
        || url.host_str() != Some("auth")
        || url.port().is_some()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.path() != "/callback"
    {
        return Err("invalid callback destination");
    }
    if url.fragment().is_some() {
        return Err("callback fragments are forbidden");
    }

    let mut pairs = url.query_pairs();
    let Some((key, code)) = pairs.next() else {
        return Err("callback must contain one bounded code");
    };
    if key != "code" || pairs.next().is_some() || code.is_empty() || code.len() > 2048 {
        return Err("callback must contain one bounded code");
    }
    Ok(code.into_owned())
}

pub fn parse_supabase_origin(value: &str) -> Result<Url, &'static str> {
    let url = Url::parse(value).map_err(|_| "Supabase origin must be a valid URL")?;
    if url.scheme() != "https"
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.path() != "/"
        || url.query().is_some()
        || url.fragment().is_some()
    {
        return Err("Supabase origin must be a credential-free HTTPS root origin");
    }
    Ok(url)
}

pub fn parse_matching_supabase_origin(
    desktop_value: &str,
    web_value: Option<&str>,
) -> Result<Url, &'static str> {
    if web_value.is_some_and(|value| value != desktop_value) {
        return Err("SCISIAM_SUPABASE_ORIGIN must exactly match NEXT_PUBLIC_SUPABASE_URL");
    }
    parse_supabase_origin(desktop_value)
}

pub fn oauth_browser_error_target(
    requested_url: &Url,
    app_origin: &Url,
    supabase_origin: &Url,
) -> Option<Url> {
    is_supabase_oauth_authorize(requested_url, supabase_origin).then(|| {
        app_origin
            .join("/login?desktop-oauth-error=browser-open-failed")
            .expect("valid app origin")
    })
}

pub fn build_web_callback(app_origin: &Url, code: &str) -> Url {
    let mut callback = app_origin
        .join("/auth/oauth-callback")
        .expect("valid app origin");
    callback
        .query_pairs_mut()
        .append_pair("code", code)
        .append_pair("next", "/profile");
    callback
}

#[derive(Debug, Default)]
pub struct CallbackCoordinator {
    ready: bool,
    pending: Option<(u64, String)>,
    delivered: HashSet<u64>,
}

impl CallbackCoordinator {
    pub fn receive(&mut self, url: &Url) -> Result<Option<String>, &'static str> {
        let code = parse_oauth_callback(url)?;
        let id = callback_id(&code);
        if self.delivered.contains(&id)
            || self
                .pending
                .as_ref()
                .is_some_and(|(pending_id, _)| *pending_id == id)
        {
            return Ok(None);
        }

        if self.ready {
            self.delivered.insert(id);
            return Ok(Some(code));
        }

        if self.pending.is_none() {
            self.pending = Some((id, code));
        }
        Ok(None)
    }

    pub fn mark_ready(&mut self) -> Option<String> {
        self.ready = true;
        let (id, code) = self.pending.take()?;
        self.delivered.insert(id);
        Some(code)
    }
}

fn callback_id(code: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    code.hash(&mut hasher);
    hasher.finish()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn app_origin() -> Url {
        Url::parse("https://scisiam-app.vercel.app").unwrap()
    }

    fn supabase_origin() -> Url {
        Url::parse("https://ekcsbxirzsbdlemtfanf.supabase.co").unwrap()
    }

    #[test]
    fn keeps_only_scisiam_navigation_inside_the_webview() {
        let app = app_origin();
        let supabase = supabase_origin();
        assert_eq!(
            classify_navigation(
                &Url::parse("https://scisiam-app.vercel.app/labs").unwrap(),
                &app,
                &supabase
            ),
            NavigationDecision::AllowInApp,
        );
        assert_eq!(
            classify_navigation(
                &Url::parse("https://example.com/help").unwrap(),
                &app,
                &supabase
            ),
            NavigationDecision::OpenExternal,
        );
        assert_eq!(
            classify_navigation(&Url::parse("javascript:alert(1)").unwrap(), &app, &supabase),
            NavigationDecision::Block,
        );
    }

    #[test]
    fn opens_only_the_expected_supabase_authorize_path_externally() {
        let app = app_origin();
        let supabase = supabase_origin();
        let authorize = Url::parse(
            "https://ekcsbxirzsbdlemtfanf.supabase.co/auth/v1/authorize?provider=google",
        )
        .unwrap();
        assert_eq!(
            classify_navigation(&authorize, &app, &supabase),
            NavigationDecision::OpenExternal
        );

        let wrong_path =
            Url::parse("https://ekcsbxirzsbdlemtfanf.supabase.co/storage/v1/object/private")
                .unwrap();
        assert_eq!(
            classify_navigation(&wrong_path, &app, &supabase),
            NavigationDecision::Block
        );
    }

    #[test]
    fn validates_and_forwards_one_pkce_code() {
        let deep_link = Url::parse("scisiam://auth/callback?code=abc-123_XYZ").unwrap();
        let code = parse_oauth_callback(&deep_link).unwrap();
        assert_eq!(code, "abc-123_XYZ");

        let callback = build_web_callback(&app_origin(), &code);
        assert_eq!(
            callback.as_str(),
            "https://scisiam-app.vercel.app/auth/oauth-callback?code=abc-123_XYZ&next=%2Fprofile",
        );
    }

    #[test]
    fn rejects_forged_or_ambiguous_callbacks() {
        for value in [
            "https://auth/callback?code=abc",
            "scisiam://evil/callback?code=abc",
            "scisiam://auth/wrong?code=abc",
            "scisiam://auth/callback",
            "scisiam://auth/callback?code=one&code=two",
            "scisiam://auth/callback?code=abc&state=unexpected",
            "scisiam://auth/callback?code=abc&error=denied",
            "scisiam://auth/callback?code=abc&access_token=secret",
            "scisiam://auth/callback?code=abc&refresh_token=secret",
            "scisiam://auth/callback?code=abc#access_token=secret",
        ] {
            assert!(
                parse_oauth_callback(&Url::parse(value).unwrap()).is_err(),
                "{value}"
            );
        }

        let oversized = format!("scisiam://auth/callback?code={}", "a".repeat(2049));
        assert!(parse_oauth_callback(&Url::parse(&oversized).unwrap()).is_err());
    }

    #[test]
    fn rejects_callback_authority_spoofing() {
        for value in [
            "scisiam://auth:123/callback?code=abc",
            "scisiam://user@auth/callback?code=abc",
            "scisiam://user:password@auth/callback?code=abc",
        ] {
            assert!(
                parse_oauth_callback(&Url::parse(value).unwrap()).is_err(),
                "{value}"
            );
        }
    }

    #[test]
    fn validates_a_credential_free_https_supabase_root_origin() {
        assert_eq!(
            parse_supabase_origin("https://ekcsbxirzsbdlemtfanf.supabase.co")
                .unwrap()
                .as_str(),
            "https://ekcsbxirzsbdlemtfanf.supabase.co/",
        );

        for value in [
            "http://ekcsbxirzsbdlemtfanf.supabase.co",
            "https://user@ekcsbxirzsbdlemtfanf.supabase.co",
            "https://user:password@ekcsbxirzsbdlemtfanf.supabase.co",
            "https://ekcsbxirzsbdlemtfanf.supabase.co/auth/v1",
            "https://ekcsbxirzsbdlemtfanf.supabase.co?project=other",
            "https://ekcsbxirzsbdlemtfanf.supabase.co#fragment",
        ] {
            assert!(parse_supabase_origin(value).is_err(), "{value}");
        }

        assert!(parse_matching_supabase_origin(
            "https://ekcsbxirzsbdlemtfanf.supabase.co",
            Some("https://ekcsbxirzsbdlemtfanf.supabase.co"),
        )
        .is_ok());
        assert!(parse_matching_supabase_origin(
            "https://ekcsbxirzsbdlemtfanf.supabase.co",
            Some("https://other-project.supabase.co"),
        )
        .is_err());
    }

    #[test]
    fn retains_one_pre_ready_callback_and_forwards_each_code_once() {
        let cold = Url::parse("scisiam://auth/callback?code=cold-code").unwrap();
        let warm = Url::parse("scisiam://auth/callback?code=warm-code").unwrap();
        let mut callbacks = CallbackCoordinator::default();

        assert_eq!(callbacks.receive(&cold), Ok(None));
        assert_eq!(callbacks.receive(&cold), Ok(None));
        assert_eq!(callbacks.mark_ready(), Some("cold-code".to_owned()));
        assert_eq!(callbacks.mark_ready(), None);
        assert_eq!(callbacks.receive(&cold), Ok(None));

        assert_eq!(callbacks.receive(&warm), Ok(Some("warm-code".to_owned())));
        assert_eq!(callbacks.receive(&warm), Ok(None));
    }

    #[test]
    fn listener_delivery_wins_deterministically_before_startup_drain() {
        let listener = Url::parse("scisiam://auth/callback?code=listener-code").unwrap();
        let startup = Url::parse("scisiam://auth/callback?code=startup-code").unwrap();
        let invalid = Url::parse("scisiam://auth/callback?access_token=secret").unwrap();
        let mut callbacks = CallbackCoordinator::default();

        assert!(callbacks.receive(&invalid).is_err());
        assert_eq!(callbacks.receive(&listener), Ok(None));
        assert_eq!(callbacks.receive(&startup), Ok(None));
        assert_eq!(callbacks.mark_ready(), Some("listener-code".to_owned()));
        assert_eq!(callbacks.receive(&listener), Ok(None));
        assert_eq!(
            callbacks.receive(&startup),
            Ok(Some("startup-code".to_owned()))
        );
    }

    #[test]
    fn oauth_browser_failure_target_is_fixed_and_contains_no_request_payload() {
        let app = app_origin();
        let supabase = supabase_origin();
        let authorize = Url::parse(
            "https://ekcsbxirzsbdlemtfanf.supabase.co/auth/v1/authorize?provider=google&code=secret",
        )
        .unwrap();
        let target = oauth_browser_error_target(&authorize, &app, &supabase).unwrap();

        assert_eq!(
            target.as_str(),
            "https://scisiam-app.vercel.app/login?desktop-oauth-error=browser-open-failed",
        );
        assert!(!target.as_str().contains("secret"));
        assert!(oauth_browser_error_target(
            &Url::parse("https://example.com/help").unwrap(),
            &app,
            &supabase,
        )
        .is_none());
        assert!(oauth_browser_error_target(
            &Url::parse("https://ekcsbxirzsbdlemtfanf.supabase.co/storage/v1/object").unwrap(),
            &app,
            &supabase,
        )
        .is_none());
    }
}
