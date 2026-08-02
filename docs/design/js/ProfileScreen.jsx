function BanheirosSwitch(props) {
  return React.createElement("button", { className: "switch" + (props.on ? " on" : ""), onClick: function () { props.onChange(!props.on); }, role: "switch", "aria-checked": props.on },
    React.createElement("span", { className: "thumb" })
  );
}

function BanheirosProfileScreen(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var user = props.user;
  var twoFa = props.twoFaEnabled;
  var setTwoFa = props.onSetTwoFaEnabled;

  return React.createElement("div", { className: "screen screen-pad", "data-screen-label": "Profile" },
    React.createElement("h2", { style: { fontSize: 22, marginBottom: "var(--space-4)" } }, t("profile.title")),
    React.createElement("div", { className: "profile-header" },
      React.createElement("div", { className: "avatar" }, user.username.slice(0, 1).toUpperCase()),
      React.createElement("div", null,
        React.createElement("div", { style: { fontWeight: 700, fontFamily: "var(--font-heading)", fontSize: 17 } }, "@" + user.username),
        React.createElement("div", { style: { fontSize: 12.5, opacity: .65 } }, user.email)
      )
    ),
    React.createElement("h4", { className: "section-title" }, t("profile.accountSection")),
    React.createElement("div", { className: "field", style: { marginBottom: "var(--space-3)" } },
      React.createElement("label", null, t("profile.usernameField")),
      React.createElement("input", { className: "input", value: user.username, onChange: function (e) { props.onUpdateUser({ username: e.target.value }); } })
    ),
    React.createElement("div", { className: "settings-row" },
      React.createElement("div", null,
        React.createElement("div", { className: "label" }, t("profile.defaultVisibilityLabel")),
        React.createElement("div", { className: "desc" }, user.defaultShowUsername ? t("profile.defaultVisibilityOn") : t("profile.defaultVisibilityOff"))
      ),
      React.createElement(BanheirosSwitch, { on: user.defaultShowUsername, onChange: function (v) { props.onUpdateUser({ defaultShowUsername: v }); } })
    ),
    React.createElement("h4", { className: "section-title" }, t("profile.languageSection")),
    React.createElement("div", { className: "seg" },
      window.BanheirosI18n.languages.map(function (code) {
        return React.createElement("label", { className: "seg-opt", key: code },
          React.createElement("input", { type: "radio", name: "lang", checked: props.lang === code, onChange: function () { props.onSetLang(code); } }),
          code.toUpperCase()
        );
      })
    ),
    React.createElement("h4", { className: "section-title" }, t("profile.securitySection")),
    React.createElement("div", { className: "settings-row" },
      React.createElement("div", null,
        React.createElement("div", { className: "label" }, t("profile.twoFaLabel")),
        React.createElement("div", { className: "desc" }, t("profile.twoFaDesc"))
      ),
      React.createElement(BanheirosSwitch, { on: twoFa, onChange: setTwoFa })
    ),
    twoFa && React.createElement("div", { className: "twofa-info" }, React.createElement(Icon, { name: "shieldCheck", size: 18 }), t("profile.twoFaEnabledInfo")),
    React.createElement("button", { className: "btn btn-secondary btn-block", style: { marginTop: "var(--space-6)" }, onClick: props.onLogout },
      React.createElement(Icon, { name: "logOut", size: 15 }), " " + t("profile.logout")
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { ProfileScreen: BanheirosProfileScreen });
