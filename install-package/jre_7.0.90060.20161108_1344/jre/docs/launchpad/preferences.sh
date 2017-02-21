echo 'user_pref("capability.principal.codebase.p0.granted", "UniversalXPConnect UniversalBrowserRead UniversalBrowserWrite");' >$userprefpath/user.js
echo 'user_pref("capability.principal.codebase.p0.id", "'${LaunchPadURL}'");' >>$userprefpath/user.js
echo 'user_pref("browser.frames.enabled", true);' >>$userprefpath/user.js
echo 'user_pref("browser.shell.checkDefaultBrowser", false);' >>$userprefpath/user.js
echo 'user_pref("javascript.enabled", true);' >>$userprefpath/user.js
echo 'user_pref("security.fileuri.origin_policy", 4);' >>$userprefpath/user.js
echo 'user_pref("security.enable_java", false);' >>$userprefpath/user.js
echo 'user_pref("security.xpconnect.plugin.unrestricted", true);' >>$userprefpath/user.js
echo 'user_pref("update_notifications.enabled", false);' >>$userprefpath/user.js
echo 'user_pref("security.warn_entering_secure", false);' >>$userprefpath/user.js
echo 'user_pref("security.warn_leaving_secure", false);' >>$userprefpath/user.js
echo 'user_pref("security.warn_entering_weak", false);' >>$userprefpath/user.js
echo 'user_pref("security.warn_viewing_mixed", false);' >>$userprefpath/user.js
echo 'user_pref("security.warn_submit_insecure", false);' >>$userprefpath/user.js
echo 'user_pref("signon.rememberSignons", false);' >>$userprefpath/user.js
echo 'user_pref("browser.bookmarks.added_static_root", true);' >>$userprefpath/user.js
echo 'user_pref("intl.charsetmenu.browser.cache", "ISO-8859-1");' >>$userprefpath/user.js
echo 'user_pref("browser.search.opensidebarsearchpanel", false);' >>$userprefpath/user.js
echo 'user_pref("privacy.popups.first_popup", false);' >>$userprefpath/user.js
echo 'user_pref("browser.allowpopups", true);' >>$userprefpath/user.js
echo 'user_pref("dom.allow_scripts_to_close_windows", true);' >>$userprefpath/user.js
echo 'user_pref("dom.disable_window_move_resize", false);' >>$userprefpath/user.js
echo 'user_pref("dom.disable_open_during_load", false);' >>$userprefpath/user.js
echo 'user_pref("dom.max_script_run_time", 60);' >>$userprefpath/user.js
echo 'user_pref("nglayout.initialpaint.delay", 0);' >>$userprefpath/user.js
echo 'user_pref("browser.link.open_external", 2);' >>$userprefpath/user.js
echo 'user_pref("security.fileuri.strict_origin_policy", false);' >>$userprefpath/user.js
echo 'user_pref("browser.EULA.3.accepted", true);' >>$userprefpath/user.js
echo 'user_pref("browser.EULA.4.accepted", true);' >>$userprefpath/user.js
echo 'user_pref("browser.EULA.5.accepted", true);' >>$userprefpath/user.js
echo 'user_pref("browser.tabs.autoHide", true);' >>$userprefpath/user.js
echo 'user_pref("browser.rights.3.shown", true);' >>$userprefpath/user.js
echo 'user_pref("browser.rights.version", 3);' >>$userprefpath/user.js
echo 'user_pref("shell.checkDefaultApps", 0);' >>$userprefpath/user.js
echo 'user_pref("shell.checkDefaultClient", false);' >>$userprefpath/user.js
echo 'user_pref("signed.applets.codebase_principal_support", true);' >>$userprefpath/user.js
echo 'user_pref("capability.policy.default.XMLHttpRequest.open", "allAccess");' >>$userprefpath/user.js
echo 'user_pref("capability.principal.codebase.p0.granted", "UniversalXPConnect UniversalBrowserRead UniversalBrowserWrite UniversalPreferencesRead UniversalPreferencesWrite UniversalFileRead");' >>$userprefpath/user.js
echo 'user_pref("dom.max_script_run_time",65530);' >>$userprefpath/user.js
echo 'user_pref("ui.key.contentAccess",4);' >>$userprefpath/user.js
