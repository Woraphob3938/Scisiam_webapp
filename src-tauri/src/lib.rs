mod navigation;

use navigation::{
    build_web_callback, classify_navigation, parse_oauth_callback, NavigationDecision,
};
use tauri::{webview::NewWindowResponse, AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_opener::OpenerExt;
use url::Url;

const PRODUCTION_ORIGIN: &str = "https://scisiam-app.vercel.app";
const DEVELOPMENT_ORIGIN: &str = "http://localhost:3000";
const DEFAULT_SUPABASE_ORIGIN: &str = "https://ekcsbxirzsbdlemtfanf.supabase.co";

fn app_origin() -> Url {
    let value = if cfg!(debug_assertions) {
        DEVELOPMENT_ORIGIN
    } else {
        PRODUCTION_ORIGIN
    };
    Url::parse(value).expect("valid SciSiam origin")
}

fn supabase_origin() -> Url {
    let value = option_env!("SCISIAM_SUPABASE_ORIGIN").unwrap_or(DEFAULT_SUPABASE_ORIGIN);
    Url::parse(value).expect("valid Supabase origin")
}

fn is_local_launcher_url(url: &Url) -> bool {
    if !url.username().is_empty() || url.password().is_some() || url.port().is_some() {
        return false;
    }

    matches!(
        (url.scheme(), url.host_str()),
        ("tauri", Some("localhost"))
            | ("http", Some("tauri.localhost"))
            | ("https", Some("tauri.localhost"))
    )
}

fn focus_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn open_external_url(app: &AppHandle, url: &Url) {
    if app.opener().open_url(url.as_str(), None::<&str>).is_err() {
        eprintln!("failed to open external URL in system browser");
    }
}

fn forward_deep_link(app: &AppHandle, url: &Url) {
    let Ok(code) = parse_oauth_callback(url) else {
        focus_main(app);
        return;
    };
    let callback = build_web_callback(&app_origin(), &code);
    if let Some(window) = app.get_webview_window("main") {
        if window.navigate(callback).is_err() {
            eprintln!("failed to forward desktop OAuth callback");
        }
    } else {
        eprintln!("failed to forward desktop OAuth callback");
    }
    focus_main(app);
}

fn create_main_window(app: &tauri::App) -> tauri::Result<()> {
    let start_url = if cfg!(debug_assertions) {
        WebviewUrl::External(app_origin())
    } else {
        WebviewUrl::App("index.html".into())
    };
    let navigation_app = app.handle().clone();
    let navigation_app_origin = app_origin();
    let navigation_supabase_origin = supabase_origin();
    let new_window_app = app.handle().clone();
    let new_window_app_origin = app_origin();
    let new_window_supabase_origin = supabase_origin();

    WebviewWindowBuilder::new(app, "main", start_url)
        .title("Scisiam")
        .inner_size(1440.0, 900.0)
        .min_inner_size(1024.0, 700.0)
        .center()
        .initialization_script(
            "Object.defineProperty(window, '__SCISIAM_DESKTOP__', { value: true, configurable: false, writable: false });",
        )
        .on_navigation(move |url| {
            if is_local_launcher_url(url) {
                return true;
            }
            match classify_navigation(url, &navigation_app_origin, &navigation_supabase_origin) {
                NavigationDecision::AllowInApp => true,
                NavigationDecision::OpenExternal => {
                    open_external_url(&navigation_app, url);
                    false
                }
                NavigationDecision::Block => false,
            }
        })
        .on_new_window(move |url, _features| {
            if classify_navigation(
                &url,
                &new_window_app_origin,
                &new_window_supabase_origin,
            ) == NavigationDecision::OpenExternal
            {
                open_external_url(&new_window_app, &url);
            }
            NewWindowResponse::Deny
        })
        .build()?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            focus_main(app);
        }));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            create_main_window(app)?;

            #[cfg(all(debug_assertions, windows))]
            app.deep_link().register_all()?;

            if let Some(urls) = app.deep_link().get_current()? {
                for url in urls {
                    forward_deep_link(app.handle(), &url);
                }
            }

            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    forward_deep_link(&handle, &url);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run SciSiam desktop");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_only_tauri_local_launcher_origins() {
        for value in [
            "tauri://localhost/index.html",
            "http://tauri.localhost/index.html",
            "https://tauri.localhost/index.html",
        ] {
            assert!(
                is_local_launcher_url(&Url::parse(value).unwrap()),
                "{value}"
            );
        }

        for value in [
            "http://localhost/index.html",
            "https://tauri.localhost.example.com/index.html",
            "tauri://attacker/index.html",
        ] {
            assert!(
                !is_local_launcher_url(&Url::parse(value).unwrap()),
                "{value}"
            );
        }
    }
}
