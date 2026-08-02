function bhIsOpenNow(hours) {
  function toMin(s) { var p = s.split(":").map(Number); return p[0] * 60 + p[1]; }
  var now = new Date(); var cur = now.getHours() * 60 + now.getMinutes();
  var o = toMin(hours.open), c = toMin(hours.close);
  if (c <= o) return true;
  return cur >= o && cur < c;
}

function BanheirosOverall(props) {
  var t = props.t;
  var val = window.BanheirosData.avg(props.ratings);
  return React.createElement("div", { className: "overall-card" },
    React.createElement("div", { className: "overall-num" }, val.toFixed(1), React.createElement("span", null, "/3")),
    React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, t("bathroom.overallScore")),
      React.createElement("div", { style: { fontSize: 11.5, opacity: .65 } }, t("bathroom.ratingsBreakdown"))
    )
  );
}

function BanheirosCatRows(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"];
  var CAT_ICON = { accessibility: "accessibility", lighting: "lightbulb", odor: "wind", maintenance: "wrench", cleanliness: "sparkles" };
  return React.createElement("div", { className: "cat-rows" },
    CATS.map(function (cat) {
      var v = Math.round(props.ratings[cat]);
      return React.createElement("div", { className: "cat-row", key: cat },
        React.createElement(Icon, { name: CAT_ICON[cat], size: 16 }),
        React.createElement("span", { className: "cat-label" }, t("ratingCat." + cat)),
        React.createElement("span", { className: "rating-dots" }, [1, 2, 3].map(function (n) {
          return React.createElement("span", { key: n, className: "dot" + (n <= v ? " filled" : "") });
        }))
      );
    })
  );
}

function BanheirosBathroomModal(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var b = props.bathroom;
  var _view = React.useState("detail"); var view = _view[0], setView = _view[1];
  var _drag = React.useState(0); var dragY = _drag[0], setDragY = _drag[1];
  var _dragging = React.useState(false); var dragging = _dragging[0], setDragging = _dragging[1];
  var _success = React.useState(false); var success = _success[0], setSuccess = _success[1];
  var startYRef = React.useRef(0);

  React.useEffect(function () { setView("detail"); setDragY(0); setSuccess(false); }, [b.id]);

  function requestClose() {
    setDragY(760);
    setTimeout(props.onClose, 240);
  }
  function onHandleDown(e) { setDragging(true); startYRef.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }
  function onHandleMove(e) { if (!dragging) return; var delta = e.clientY - startYRef.current; if (delta > 0) setDragY(delta); }
  function onHandleUp() { setDragging(false); if (dragY > 110) requestClose(); else setDragY(0); }

  var openNow = bhIsOpenNow(b.hours);

  function handleReviewSubmit(review) {
    props.onAddReview(b.id, review);
    setView("detail");
    setSuccess(true);
    setTimeout(function () { setSuccess(false); }, 3000);
  }

  return React.createElement("div", { className: "sheet-backdrop", onClick: function (e) { if (e.target === e.currentTarget) requestClose(); } },
    React.createElement("div", {
      className: "sheet" + (dragging ? " dragging" : ""),
      style: { transform: "translateY(" + dragY + "px)" },
      "data-screen-label": "Bathroom detail"
    },
      React.createElement("div", { className: "sheet-handle-area", onPointerDown: onHandleDown, onPointerMove: onHandleMove, onPointerUp: onHandleUp },
        React.createElement("div", { className: "sheet-handle" })
      ),
      React.createElement("div", { className: "sheet-header" },
        React.createElement("div", { style: { flex: 1 } }),
        React.createElement("button", { className: "sheet-close", onClick: requestClose, "aria-label": t("common.close") }, React.createElement(Icon, { name: "x", size: 16 }))
      ),
      React.createElement("div", { className: "sheet-body" },
        view === "detail" ? React.createElement(React.Fragment, null,
          success && React.createElement("div", { className: "success-banner" }, React.createElement(Icon, { name: "check", size: 16 }), t("review.successMessage")),
          React.createElement("div", { className: "bh-title-row" },
            React.createElement("div", { className: "bh-tags" },
              React.createElement("span", { className: "tag " + (b.category.indexOf("instore") === 0 ? "tag-accent-2" : "tag-accent") }, t("category." + b.category)),
              b.category.indexOf("paid") !== -1 ? React.createElement("span", { className: "tag tag-outline" }, t("common.paid")) : React.createElement("span", { className: "tag tag-neutral" }, t("common.free"))
            ),
            React.createElement("h3", { className: "bh-name" }, b.name)
          ),
          React.createElement("div", { className: "photo-row" },
            [1, 2, 3].map(function (i) { return React.createElement("div", { className: "photo-slot", key: i }, React.createElement(Icon, { name: "camera", size: 20 })); })
          ),
          React.createElement("div", { className: "info-row" }, React.createElement(Icon, { name: "mapPin", size: 16 }), b.address),
          React.createElement("div", { className: "info-row" },
            React.createElement(Icon, { name: "clock", size: 16 }),
            t("bathroom.hoursToday") + ": " + b.hours.open + " – " + b.hours.close,
            React.createElement("span", { className: "status-pill " + (openNow ? "open" : "closed"), style: { marginLeft: "auto" } }, openNow ? t("bathroom.openNow") : t("bathroom.closedNow"))
          ),
          React.createElement(BanheirosOverall, { t: t, ratings: b.ratings }),
          React.createElement(BanheirosCatRows, { t: t, ratings: b.ratings }),
          React.createElement("div", { className: "actions-row" },
            React.createElement("button", { className: "btn btn-secondary star-btn" + (props.isFavorite ? " active" : ""), onClick: function () { props.onToggleFavorite(b.id); }, "aria-label": t("bathroom.favorite") },
              React.createElement(Icon, { name: "star", size: 18 })
            ),
            React.createElement("button", { className: "btn btn-primary", onClick: function () { setView("review"); } }, t("bathroom.writeReview"))
          ),
          React.createElement("h4", { className: "section-title" }, t("bathroom.reviewsTitle") + " (" + b.reviews.length + ")"),
          b.reviews.length === 0 ? React.createElement("p", { className: "empty-note" }, t("bathroom.noReviews")) :
            b.reviews.map(function (r) {
              return React.createElement("div", { className: "review-card", key: r.id },
                React.createElement("div", { className: "review-top" },
                  React.createElement("span", { className: "review-author" }, r.author ? r.author : t("common.anonymous"), r.isNew && React.createElement("span", { className: "tag tag-accent-2 review-new-tag" }, t("common.today"))),
                  React.createElement("span", { className: "review-date" }, r.date)
                ),
                React.createElement("p", { className: "review-comment" }, r.comment)
              );
            }),
          React.createElement("button", { className: "report-link" }, React.createElement(Icon, { name: "flag", size: 13 }), t("bathroom.reportIssue"))
        ) : React.createElement(window.Banheiros.ReviewComposer, {
          t: t, username: props.username, defaultShowUsername: props.defaultShowUsername,
          onCancel: function () { setView("detail"); }, onSubmit: handleReviewSubmit
        })
      )
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { BathroomModal: BanheirosBathroomModal, isOpenNow: bhIsOpenNow });
