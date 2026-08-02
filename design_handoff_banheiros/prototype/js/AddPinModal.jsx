function BanheirosAddPinModal(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var _f = React.useState({ name: "", category: "public", address: "", open: "08:00", close: "18:00" });
  var form = _f[0], setForm = _f[1];
  var _sent = React.useState(false); var sent = _sent[0], setSent = _sent[1];
  function set(k, v) { setForm(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); }
  var valid = form.name.trim().length > 2 && form.address.trim().length > 3;
  var cats = ["public", "instore", "public_paid", "instore_paid"];

  return React.createElement("div", { className: "dialog-backdrop", onClick: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
    React.createElement("div", { className: "dialog", "data-screen-label": "Add bathroom" },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("h3", { className: "dialog-title" }, t("addPin.title")),
        React.createElement("button", { className: "sheet-close", onClick: props.onClose, "aria-label": t("common.close") }, React.createElement(Icon, { name: "x", size: 15 }))
      ),
      sent ? React.createElement("div", { className: "success-banner" }, React.createElement(Icon, { name: "check", size: 16 }), t("addPin.successNote")) :
        React.createElement(React.Fragment, null,
          React.createElement("div", { className: "field" },
            React.createElement("label", null, t("addPin.nameLabel")),
            React.createElement("input", { className: "input", value: form.name, onChange: function (e) { set("name", e.target.value); } })
          ),
          React.createElement("div", { className: "field" },
            React.createElement("label", null, t("addPin.categoryLabel")),
            React.createElement("div", { className: "seg", style: { flexWrap: "wrap" } },
              cats.map(function (c) {
                return React.createElement("label", { className: "seg-opt", key: c },
                  React.createElement("input", { type: "radio", name: "addcat", checked: form.category === c, onChange: function () { set("category", c); } }),
                  t("category." + c)
                );
              })
            )
          ),
          React.createElement("div", { className: "field" },
            React.createElement("label", null, t("addPin.addressLabel")),
            React.createElement("input", { className: "input", value: form.address, onChange: function (e) { set("address", e.target.value); } })
          ),
          React.createElement("div", { className: "field" },
            React.createElement("label", null, t("addPin.hoursLabel")),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
              React.createElement("input", { className: "input", type: "time", value: form.open, onChange: function (e) { set("open", e.target.value); } }),
              React.createElement("input", { className: "input", type: "time", value: form.close, onChange: function (e) { set("close", e.target.value); } })
            )
          )
        ),
      React.createElement("div", { className: "dialog-actions" },
        !sent && React.createElement("button", { className: "btn btn-primary btn-block", disabled: !valid, onClick: function () { setSent(true); setTimeout(props.onClose, 1800); } }, t("addPin.submit"))
      )
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { AddPinModal: BanheirosAddPinModal });
