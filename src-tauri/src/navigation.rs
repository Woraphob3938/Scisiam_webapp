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
        return if url.path() == "/auth/v1/authorize" {
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
    if url.scheme() != "scisiam" || url.host_str() != Some("auth") || url.path() != "/callback" {
        return Err("invalid callback destination");
    }
    if url.fragment().is_some() {
        return Err("callback fragments are forbidden");
    }

    let codes: Vec<String> = url
        .query_pairs()
        .filter(|(key, _)| key == "code")
        .map(|(_, value)| value.into_owned())
        .collect();
    if codes.len() != 1 || codes[0].is_empty() || codes[0].len() > 2048 {
        return Err("callback must contain one bounded code");
    }
    Ok(codes[0].clone())
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
}
