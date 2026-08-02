function bhSanitizeUsername(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 20);
}
function bhSuggestUsername(email) {
  var base = bhSanitizeUsername((email || "").split("@")[0]) || "usuario";
  var taken = window.BanheirosData.takenUsernames;
  if (taken.indexOf(base) === -1) return base;
  var i = 1;
  while (taken.indexOf(base + i) !== -1) i++;
  return base + i;
}

function BanheirosPasswordField(props) {
  var Icon = window.Banheiros.Icon;
  return React.createElement("div", { className: "field" },
    React.createElement("label", null, props.label),
    React.createElement("div", { className: "pw-field" },
      React.createElement("input", { className: "input", type: props.show ? "text" : "password", value: props.value, onChange: props.onChange }),
      React.createElement("button", { className: "pw-toggle", type: "button", onClick: props.onToggleShow }, React.createElement(Icon, { name: props.show ? "eyeOff" : "eye", size: 16 }))
    )
  );
}

function BanheirosAuthScreen(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var GoogleLogo = window.Banheiros.GoogleLogo;
  var _mode = React.useState("login"); var mode = _mode[0], setMode = _mode[1];
  var _showPw = React.useState(false); var showPw = _showPw[0], setShowPw = _showPw[1];
  var _showPw2 = React.useState(false); var showPw2 = _showPw2[0], setShowPw2 = _showPw2[1];
  var _form = React.useState({ username: "", email: "", password: "", confirm: "", agree: false });
  var form = _form[0], setForm = _form[1];
  var _unameTouched = React.useState(false); var usernameTouched = _unameTouched[0], setUsernameTouched = _unameTouched[1];

  function set(k, v) { setForm(function (prev) { var next = Object.assign({}, prev); next[k] = v; return next; }); }

  React.useEffect(function () {
    if (mode === "signup" && !usernameTouched) {
      set("username", form.email.trim() ? bhSuggestUsername(form.email) : "");
    }
  }, [form.email, mode]);

  var taken = window.BanheirosData.takenUsernames;
  var usernameIsTaken = form.username.trim().length > 0 && taken.indexOf(form.username.trim().toLowerCase()) !== -1;
  var usernameSuggestionAlt = usernameIsTaken ? bhSuggestUsername(form.username) : null;

  var loginValid = form.email.trim().length > 3 && form.password.length >= 4;
  var signupValid = form.email.trim().length > 3 && form.username.trim().length >= 3 && !usernameIsTaken && form.password.length >= 6 && form.password === form.confirm && form.agree;

  function submitLogin() {
    if (!loginValid) return;
    props.onLogin({ username: (form.email.split("@")[0]).toLowerCase(), email: form.email, defaultShowUsername: false });
  }
  function submitSignup() {
    if (!signupValid) return;
    props.onLogin({ username: form.username.trim().toLowerCase(), email: form.email, defaultShowUsername: false });
  }
  function loginWithGoogle() {
    props.onLogin({ username: "convidado_google2", email: "convidado@gmail.com", defaultShowUsername: false });
  }

  return React.createElement("div", { className: "auth-screen", "data-screen-label": mode === "login" ? "Login" : "Signup" },
    React.createElement("button", { className: "icon-btn-float lang-pick", onClick: function () { props.onSetLang(props.lang === "pt" ? "en" : "pt"); }, "aria-label": "language" },
      React.createElement(Icon, { name: "globe", size: 16 })
    ),
    React.createElement("div", { className: "auth-brand" },
      React.createElement("div", { className: "mark" }, React.createElement(Icon, { name: "mapPin", size: 20 })),
      React.createElement("span", null, t("common.appName"))
    ),
    React.createElement("h1", { className: "auth-title" }, t("auth.welcomeTitle")),
    React.createElement("p", { className: "auth-sub" }, t("auth.welcomeSubtitle")),
    mode === "login" ? React.createElement("div", { className: "auth-form" },
      React.createElement("div", { className: "field" },
        React.createElement("label", null, t("auth.emailLabel")),
        React.createElement("input", { className: "input", type: "email", value: form.email, onChange: function (e) { set("email", e.target.value); } })
      ),
      React.createElement(BanheirosPasswordField, { label: t("auth.passwordLabel"), value: form.password, show: showPw, onToggleShow: function () { setShowPw(!showPw); }, onChange: function (e) { set("password", e.target.value); } }),
      React.createElement("div", { className: "form-links" }, React.createElement("button", { className: "btn btn-ghost", style: { padding: 0, fontSize: 12.5 } }, t("auth.forgotPassword"))),
      React.createElement("button", { className: "btn btn-primary btn-block", disabled: !loginValid, onClick: submitLogin }, t("auth.loginButton")),
      React.createElement("div", { className: "divider-row" }, React.createElement("span", { className: "line" }), t("auth.orDivider"), React.createElement("span", { className: "line" })),
      React.createElement("button", { className: "btn btn-secondary btn-block", onClick: loginWithGoogle }, React.createElement(GoogleLogo, { size: 16 }), " " + t("auth.googleButton")),
      React.createElement("p", { className: "switch-mode" }, t("auth.noAccount") + " ", React.createElement("button", { onClick: function () { setMode("signup"); } }, t("auth.createAccountLink")))
    ) : React.createElement("div", { className: "auth-form" },
      React.createElement("div", { className: "field" },
        React.createElement("label", null, t("auth.emailLabel")),
        React.createElement("input", { className: "input", type: "email", value: form.email, onChange: function (e) { set("email", e.target.value); } })
      ),
      React.createElement("div", { className: "field" },
        React.createElement("label", null, t("auth.usernameLabel")),
        React.createElement("input", {
          className: "input" + (usernameIsTaken ? " taken" : ""), value: form.username,
          onChange: function (e) { setUsernameTouched(true); set("username", e.target.value); }
        }),
        usernameIsTaken
          ? React.createElement("p", { className: "field-note warn" },
              t("auth.usernameTaken") + " ",
              React.createElement("button", { type: "button", className: "suggest-chip", onClick: function () { setUsernameTouched(true); set("username", usernameSuggestionAlt); } }, t("auth.usernameUseSuggestion", { name: usernameSuggestionAlt }))
            )
          : React.createElement("p", { className: "field-note" }, usernameTouched ? t("auth.usernameHint") : t("auth.usernameSuggestedNote"))
      ),
      React.createElement(BanheirosPasswordField, { label: t("auth.passwordLabel"), value: form.password, show: showPw, onToggleShow: function () { setShowPw(!showPw); }, onChange: function (e) { set("password", e.target.value); } }),
      React.createElement(BanheirosPasswordField, { label: t("auth.confirmPasswordLabel"), value: form.confirm, show: showPw2, onToggleShow: function () { setShowPw2(!showPw2); }, onChange: function (e) { set("confirm", e.target.value); } }),
      React.createElement("label", { className: "checkbox-row" },
        React.createElement("input", { type: "checkbox", checked: form.agree, onChange: function (e) { set("agree", e.target.checked); } }),
        t("auth.termsAgree")
      ),
      React.createElement("button", { className: "btn btn-primary btn-block", disabled: !signupValid, onClick: submitSignup }, t("auth.signupButton")),
      React.createElement("div", { className: "divider-row" }, React.createElement("span", { className: "line" }), t("auth.orDivider"), React.createElement("span", { className: "line" })),
      React.createElement("button", { className: "btn btn-secondary btn-block", onClick: loginWithGoogle }, React.createElement(GoogleLogo, { size: 16 }), " " + t("auth.googleButton")),
      React.createElement("p", { className: "switch-mode" }, t("auth.haveAccount") + " ", React.createElement("button", { onClick: function () { setMode("login"); } }, t("auth.loginLink")))
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { AuthScreen: BanheirosAuthScreen });
