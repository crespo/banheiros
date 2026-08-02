function BanheirosAuthScreen(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var GoogleLogo = window.Banheiros.GoogleLogo;
  var _mode = React.useState("login"); var mode = _mode[0], setMode = _mode[1];
  var _showPw = React.useState(false); var showPw = _showPw[0], setShowPw = _showPw[1];
  var _showPw2 = React.useState(false); var showPw2 = _showPw2[0], setShowPw2 = _showPw2[1];
  var _form = React.useState({ name: "", username: "", email: "", password: "", confirm: "", agree: false });
  var form = _form[0], setForm = _form[1];

  function set(k, v) { setForm(function (prev) { var next = Object.assign({}, prev); next[k] = v; return next; }); }

  var loginValid = form.email.trim().length > 3 && form.password.length >= 4;
  var signupValid = form.name.trim().length > 1 && form.email.trim().length > 3 && form.password.length >= 6 && form.password === form.confirm && form.agree;

  function submitLogin() {
    if (!loginValid) return;
    props.onLogin({ name: form.name || form.email.split("@")[0], email: form.email, username: (form.email.split("@")[0]).toLowerCase(), defaultShowUsername: false });
  }
  function submitSignup() {
    if (!signupValid) return;
    props.onLogin({ name: form.name, email: form.email, username: form.username || form.name.toLowerCase().replace(/\s+/g, ""), defaultShowUsername: false });
  }
  function loginWithGoogle() {
    props.onLogin({ name: "Convidado Google", email: "convidado@gmail.com", username: "convidado_google", defaultShowUsername: false });
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
      React.createElement("div", { className: "field pw-field" },
        React.createElement("label", null, t("auth.passwordLabel")),
        React.createElement("input", { className: "input", type: showPw ? "text" : "password", value: form.password, onChange: function (e) { set("password", e.target.value); } }),
        React.createElement("button", { className: "pw-toggle", type: "button", onClick: function () { setShowPw(!showPw); } }, React.createElement(Icon, { name: showPw ? "eyeOff" : "eye", size: 16 }))
      ),
      React.createElement("div", { className: "form-links" }, React.createElement("button", { className: "btn btn-ghost", style: { padding: 0, fontSize: 12.5 } }, t("auth.forgotPassword"))),
      React.createElement("button", { className: "btn btn-primary btn-block", disabled: !loginValid, onClick: submitLogin }, t("auth.loginButton")),
      React.createElement("div", { className: "divider-row" }, React.createElement("span", { className: "line" }), t("auth.orDivider"), React.createElement("span", { className: "line" })),
      React.createElement("button", { className: "btn btn-secondary btn-block", onClick: loginWithGoogle }, React.createElement(GoogleLogo, { size: 16 }), " " + t("auth.googleButton")),
      React.createElement("p", { className: "field-note", style: { textAlign: "center" } }, t("auth.twoFaNote")),
      React.createElement("p", { className: "switch-mode" }, t("auth.noAccount") + " ", React.createElement("button", { onClick: function () { setMode("signup"); } }, t("auth.createAccountLink")))
    ) : React.createElement("div", { className: "auth-form" },
      React.createElement("div", { className: "field" },
        React.createElement("label", null, t("auth.nameLabel")),
        React.createElement("input", { className: "input", value: form.name, onChange: function (e) { set("name", e.target.value); } })
      ),
      React.createElement("div", { className: "field" },
        React.createElement("label", null, t("auth.usernameLabel") + " (" + t("common.optional") + ")"),
        React.createElement("input", { className: "input", value: form.username, onChange: function (e) { set("username", e.target.value); } }),
        React.createElement("p", { className: "field-note" }, t("auth.usernameHint"))
      ),
      React.createElement("div", { className: "field" },
        React.createElement("label", null, t("auth.emailLabel")),
        React.createElement("input", { className: "input", type: "email", value: form.email, onChange: function (e) { set("email", e.target.value); } })
      ),
      React.createElement("div", { className: "field pw-field" },
        React.createElement("label", null, t("auth.passwordLabel")),
        React.createElement("input", { className: "input", type: showPw ? "text" : "password", value: form.password, onChange: function (e) { set("password", e.target.value); } }),
        React.createElement("button", { className: "pw-toggle", type: "button", onClick: function () { setShowPw(!showPw); } }, React.createElement(Icon, { name: showPw ? "eyeOff" : "eye", size: 16 }))
      ),
      React.createElement("div", { className: "field pw-field" },
        React.createElement("label", null, t("auth.confirmPasswordLabel")),
        React.createElement("input", { className: "input", type: showPw2 ? "text" : "password", value: form.confirm, onChange: function (e) { set("confirm", e.target.value); } }),
        React.createElement("button", { className: "pw-toggle", type: "button", onClick: function () { setShowPw2(!showPw2); } }, React.createElement(Icon, { name: showPw2 ? "eyeOff" : "eye", size: 16 }))
      ),
      React.createElement("label", { className: "checkbox-row" },
        React.createElement("input", { type: "checkbox", checked: form.agree, onChange: function (e) { set("agree", e.target.checked); } }),
        t("auth.termsAgree")
      ),
      React.createElement("button", { className: "btn btn-primary btn-block", disabled: !signupValid, onClick: submitSignup }, t("auth.signupButton")),
      React.createElement("div", { className: "divider-row" }, React.createElement("span", { className: "line" }), t("auth.orDivider"), React.createElement("span", { className: "line" })),
      React.createElement("button", { className: "btn btn-secondary btn-block", onClick: loginWithGoogle }, React.createElement(GoogleLogo, { size: 16 }), " " + t("auth.googleButton")),
      React.createElement("p", { className: "field-note", style: { textAlign: "center" } }, t("auth.twoFaNote")),
      React.createElement("p", { className: "switch-mode" }, t("auth.haveAccount") + " ", React.createElement("button", { onClick: function () { setMode("login"); } }, t("auth.loginLink")))
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { AuthScreen: BanheirosAuthScreen });
