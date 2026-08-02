function BanheirosReviewComposer(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"];
  var CAT_ICON = { accessibility: "accessibility", lighting: "lightbulb", odor: "wind", maintenance: "wrench", cleanliness: "sparkles" };

  var _r = React.useState({}); var ratings = _r[0], setRatings = _r[1];
  var _c = React.useState(""); var comment = _c[0], setComment = _c[1];
  var _v = React.useState(props.defaultShowUsername); var showUsername = _v[0], setShowUsername = _v[1];

  var flagged = window.BanheirosI18n.containsBanned(comment);
  var allRated = CATS.every(function (c) { return ratings[c]; });
  var canSubmit = allRated && comment.trim().length > 3 && !flagged;

  function setRating(cat, val) { setRatings(function (prev) { var next = Object.assign({}, prev); next[cat] = val; return next; }); }

  function handleSubmit() {
    if (!canSubmit) return;
    var review = {
      id: "r" + Date.now(),
      author: showUsername ? props.username : null,
      date: new Date().toISOString().slice(0, 10),
      comment: comment.trim(),
      categoryRatings: ratings,
      isNew: true
    };
    props.onSubmit(review);
  }

  return React.createElement("div", null,
    React.createElement("div", { className: "composer-head" },
      React.createElement("button", { onClick: props.onCancel, "aria-label": t("common.back") }, React.createElement(Icon, { name: "arrowLeft", size: 20 })),
      React.createElement("h3", { style: { margin: 0, fontSize: 18 } }, t("review.title"))
    ),
    React.createElement("h4", { className: "section-title" }, t("review.yourRating")),
    CATS.map(function (cat) {
      return React.createElement("div", { className: "composer-cat", key: cat },
        React.createElement("div", { className: "composer-cat-label" }, React.createElement(Icon, { name: CAT_ICON[cat], size: 16 }), t("ratingCat." + cat)),
        React.createElement("div", { className: "rating-dots pick" },
          [1, 2, 3].map(function (v) {
            return React.createElement("button", { key: v, type: "button", className: "dot" + (ratings[cat] === v ? " filled" : ""), onClick: function () { setRating(cat, v); } }, v);
          })
        )
      );
    }),
    React.createElement("h4", { className: "section-title" }, t("review.commentLabel")),
    React.createElement("textarea", { className: "input", rows: 4, placeholder: t("review.commentPlaceholder"), value: comment, onChange: function (e) { setComment(e.target.value); } }),
    flagged && React.createElement("div", { className: "mod-warning" }, React.createElement(Icon, { name: "alertTriangle", size: 16 }), t("review.moderationWarning")),
    React.createElement("div", { className: "visibility-card" },
      React.createElement("h4", { className: "section-title", style: { margin: "0 0 8px" } }, t("review.usernameVisibility")),
      React.createElement("label", { className: "visibility-opt" },
        React.createElement("input", { type: "radio", name: "vis", checked: !showUsername, onChange: function () { setShowUsername(false); } }),
        t("review.hideUsername")
      ),
      React.createElement("label", { className: "visibility-opt" },
        React.createElement("input", { type: "radio", name: "vis", checked: showUsername, onChange: function () { setShowUsername(true); } }),
        t("review.showUsername") + " (" + props.username + ")"
      ),
      React.createElement("p", { className: "field-note" }, t("review.hideUsernameNote", { default: props.defaultShowUsername ? t("profile.defaultVisibilityOn") : t("profile.defaultVisibilityOff") }))
    ),
    React.createElement("button", { className: "btn btn-primary btn-block", disabled: !canSubmit, onClick: handleSubmit }, t("review.submit"))
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { ReviewComposer: BanheirosReviewComposer });
