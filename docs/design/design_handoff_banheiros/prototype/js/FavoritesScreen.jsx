function BanheirosFavoritesScreen(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var favs = props.bathrooms.filter(function (b) { return props.favorites.has(b.id); });

  if (favs.length === 0) {
    return React.createElement("div", { className: "screen screen-pad", "data-screen-label": "Favorites" },
      React.createElement("h2", { style: { fontSize: 22 } }, t("favorites.title")),
      React.createElement("div", { className: "empty-state" },
        React.createElement("div", { className: "circle" }, React.createElement(Icon, { name: "star", size: 26 })),
        React.createElement("div", { style: { fontWeight: 700 } }, t("favorites.emptyTitle")),
        React.createElement("div", { style: { fontSize: 12.5 } }, t("favorites.emptySubtitle"))
      )
    );
  }

  return React.createElement("div", { className: "screen screen-pad", "data-screen-label": "Favorites" },
    React.createElement("h2", { style: { fontSize: 22, marginBottom: "var(--space-4)" } }, t("favorites.title")),
    React.createElement("div", { className: "fav-list" },
      favs.map(function (b) {
        var meta = window.BanheirosData.CATEGORY_META[b.category];
        var score = window.BanheirosData.avg(b.ratings).toFixed(1);
        return React.createElement("div", { className: "card fav-card", key: b.id, onClick: function () { props.onSelectBathroom(b.id); } },
          React.createElement("div", { className: "fav-icon tone-" + meta.tone, style: { background: meta.tone === "accent" ? "var(--color-accent)" : "var(--color-accent-2-700)" } },
            React.createElement(Icon, { name: meta.icon, size: 18 })
          ),
          React.createElement("div", { className: "fav-body" },
            React.createElement("p", { className: "fav-name" }, b.name),
            React.createElement("p", { className: "fav-addr" }, b.address + " · " + score + "/3")
          ),
          React.createElement("button", { className: "fav-unstar", onClick: function (e) { e.stopPropagation(); props.onToggleFavorite(b.id); }, "aria-label": t("bathroom.favorited") },
            React.createElement(Icon, { name: "star", size: 20 })
          )
        );
      })
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { FavoritesScreen: BanheirosFavoritesScreen });
