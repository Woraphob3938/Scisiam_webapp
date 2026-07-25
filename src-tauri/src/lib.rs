mod navigation;

use navigation::{
    build_web_callback, classify_navigation, oauth_browser_error_target,
    parse_matching_supabase_origin, CallbackCoordinator, NavigationDecision,
};
use std::sync::{Arc, Mutex};
use tauri::{webview::NewWindowResponse, AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
#[cfg(desktop)]
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_opener::OpenerExt;
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;
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
    parse_matching_supabase_origin(value, option_env!("NEXT_PUBLIC_SUPABASE_URL"))
        .expect("valid matching Supabase origin configuration")
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

fn navigate_main(app: &AppHandle, url: &Url, failure_message: &str) {
    if let Some(window) = app.get_webview_window("main") {
        if window.navigate(url.clone()).is_err() {
            eprintln!("{failure_message}");
        }
    } else {
        eprintln!("{failure_message}");
    }
}

fn open_external_url(app: &AppHandle, url: &Url, configured_supabase_origin: &Url) {
    if app.opener().open_url(url.as_str(), None::<&str>).is_ok() {
        return;
    }

    if let Some(error_url) =
        oauth_browser_error_target(url, &app_origin(), configured_supabase_origin)
    {
        navigate_main(
            app,
            &error_url,
            "failed to show desktop OAuth browser error",
        );
    } else {
        eprintln!("failed to open external URL in system browser");
    }
}

fn lock_callbacks(
    callbacks: &Mutex<CallbackCoordinator>,
) -> std::sync::MutexGuard<'_, CallbackCoordinator> {
    callbacks
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn forward_callback_code(app: &AppHandle, code: &str) {
    let callback = build_web_callback(&app_origin(), code);
    navigate_main(app, &callback, "failed to forward desktop OAuth callback");
    focus_main(app);
}

fn receive_deep_link(app: &AppHandle, callbacks: &Mutex<CallbackCoordinator>, url: &Url) {
    let received = lock_callbacks(callbacks).receive(url);
    if let Ok(Some(code)) = received {
        forward_callback_code(app, &code);
    } else {
        focus_main(app);
    }
}

fn mark_main_ready(app: &AppHandle, callbacks: &Mutex<CallbackCoordinator>) {
    let pending = lock_callbacks(callbacks).mark_ready();
    if let Some(code) = pending {
        forward_callback_code(app, &code);
    }
}

fn navigate_new_window_in_main(app: &AppHandle, url: &Url) {
    navigate_main(
        app,
        url,
        "failed to navigate same-origin link in main window",
    );
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
                    open_external_url(&navigation_app, url, &navigation_supabase_origin);
                    false
                }
                NavigationDecision::Block => false,
            }
        })
        .on_new_window(move |url, _features| {
            match classify_navigation(
                &url,
                &new_window_app_origin,
                &new_window_supabase_origin,
            ) {
                NavigationDecision::AllowInApp => navigate_new_window_in_main(&new_window_app, &url),
                NavigationDecision::OpenExternal => {
                    open_external_url(&new_window_app, &url, &new_window_supabase_origin);
                }
                NavigationDecision::Block => {}
            }
            NewWindowResponse::Deny
        })
        .build()?;
    Ok(())
}

#[cfg(desktop)]
fn check_for_updates(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let updater = match app.updater() {
            Ok(updater) => updater,
            Err(error) => {
                eprintln!("desktop updater unavailable: {error}");
                return;
            }
        };
        let update = match updater.check().await {
            Ok(Some(update)) => update,
            Ok(None) => return,
            Err(error) => {
                eprintln!("desktop update check failed: {error}");
                return;
            }
        };

        let should_update = app
            .dialog()
            .message(format!(
                "เวอร์ชัน {} พร้อมติดตั้ง อัปเดตตอนนี้เพื่อรับการปรับปรุงล่าสุด",
                update.version
            ))
            .title("Scisiam เวอร์ชันใหม่พร้อมใช้งาน")
            .kind(MessageDialogKind::Info)
            .buttons(MessageDialogButtons::OkCancelCustom(
                "อัปเดตตอนนี้".into(),
                "ไว้ทีหลัง".into(),
            ))
            .blocking_show();

        if should_update {
            if let Err(error) = update.download_and_install(|_, _| {}, || {}).await {
                eprintln!("desktop update install failed: {error}");
                app.dialog()
                    .message("ยังติดตั้งอัปเดตไม่สำเร็จ กรุณาลองใหม่เมื่ออินเทอร์เน็ตพร้อม")
                    .title("อัปเดต Scisiam ไม่สำเร็จ")
                    .kind(MessageDialogKind::Error)
                    .buttons(MessageDialogButtons::OkCustom("ตกลง".into()))
                    .blocking_show();
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
                focus_main(app);
            }))
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            #[cfg(all(debug_assertions, windows))]
            app.deep_link().register_all()?;

            let callbacks = Arc::new(Mutex::new(CallbackCoordinator::default()));
            let listener_handle = app.handle().clone();
            let listener_callbacks = Arc::clone(&callbacks);
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    receive_deep_link(&listener_handle, &listener_callbacks, &url);
                }
            });

            if let Some(urls) = app.deep_link().get_current()? {
                for url in urls {
                    receive_deep_link(app.handle(), &callbacks, &url);
                }
            }

            create_main_window(app)?;
            mark_main_ready(app.handle(), &callbacks);
            #[cfg(desktop)]
            check_for_updates(app.handle().clone());
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
