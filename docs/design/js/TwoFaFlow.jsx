function BanheirosTwoFaOffer(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  return React.createElement("div", { className: "auth-screen", "data-screen-label": "2FA offer" },
    React.createElement("div", { className: "auth-brand" },
      React.createElement("div", { className: "mark" }, React.createElement(Icon, { name: "shieldCheck", size: 20 })),
      React.createElement("span", null, t("common.appName"))
    ),
    React.createElement("h1", { className: "auth-title" }, t("twofa.offerTitle")),
    React.createElement("p", { className: "auth-sub" }, t("twofa.offerBody")),
    React.createElement("div", { className: "auth-form", style: { marginTop: "var(--space-4)" } },
      React.createElement("button", { className: "btn btn-primary btn-block", onClick: props.onEnable }, t("twofa.enable")),
      React.createElement("button", { className: "btn btn-secondary btn-block", onClick: props.onSkip }, t("twofa.skip"))
    )
  );
}

function BanheirosTwoFaEnroll(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var _step = React.useState("qr"); var step = _step[0], setStep = _step[1];
  var _code = React.useState(""); var code = _code[0], setCode = _code[1];

  return React.createElement("div", { className: "auth-screen", "data-screen-label": "2FA enroll" },
    React.createElement("div", { className: "auth-brand" },
      React.createElement("div", { className: "mark" }, React.createElement(Icon, { name: "shieldCheck", size: 20 })),
      React.createElement("span", null, t("common.appName"))
    ),
    step === "qr" ? React.createElement(React.Fragment, null,
      React.createElement("h1", { className: "auth-title" }, t("twofa.enrollTitle")),
      React.createElement("p", { className: "auth-sub" }, t("twofa.enrollScanText")),
      React.createElement("div", { className: "qr-box" },
        Array.from({ length: 49 }).map(function (_, i) {
          var on = (i * 17 + Math.floor(i / 7) * 5) % 3 !== 0;
          return React.createElement("span", { key: i, className: "qr-cell" + (on ? " on" : "") });
        })
      ),
      React.createElement("div", { className: "field", style: { marginTop: "var(--space-4)" } },
        React.createElement("label", null, t("twofa.manualKeyLabel")),
        React.createElement("input", { className: "input", readOnly: true, value: "BNHR 7F2K 9QRX 3LMD" })
      ),
      React.createElement("button", { className: "btn btn-primary btn-block", onClick: function () { setStep("code"); } }, t("twofa.continue"))
    ) : React.createElement(React.Fragment, null,
      React.createElement("h1", { className: "auth-title" }, t("twofa.codeLabel")),
      React.createElement("div", { className: "field", style: { marginTop: "var(--space-3)" } },
        React.createElement("input", { className: "input code-input", inputMode: "numeric", maxLength: 6, value: code, onChange: function (e) { setCode(e.target.value.replace(/\D/g, "")); } })
      ),
      React.createElement("button", { className: "btn btn-primary btn-block", disabled: code.length !== 6, onClick: props.onConfirm }, t("twofa.confirm")),
      React.createElement("button", { className: "btn btn-ghost btn-block", onClick: function () { setStep("qr"); } }, t("twofa.back"))
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { TwoFaOffer: BanheirosTwoFaOffer, TwoFaEnroll: BanheirosTwoFaEnroll });
