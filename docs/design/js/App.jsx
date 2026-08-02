function BanheirosApp() {
  var Icon = window.Banheiros.Icon;
  var _lang = React.useState("pt"); var lang = _lang[0], setLang = _lang[1];
  var _loggedIn = React.useState(false); var loggedIn = _loggedIn[0], setLoggedIn = _loggedIn[1];
  var _user = React.useState(null); var user = _user[0], setUser = _user[1];
  var _tab = React.useState("map"); var tab = _tab[0], setTab = _tab[1];
  var _bathrooms = React.useState(function () { return JSON.parse(JSON.stringify(window.BanheirosData.bathrooms)); });
  var bathrooms = _bathrooms[0], setBathrooms = _bathrooms[1];
  var _favs = React.useState(function () { return new Set(); }); var favorites = _favs[0], setFavorites = _favs[1];
  var _selected = React.useState(null); var selectedId = _selected[0], setSelectedId = _selected[1];
  var _addPin = React.useState(false); var addPinOpen = _addPin[0], setAddPinOpen = _addPin[1];
  var _twoFa = React.useState(false); var twoFaEnabled = _twoFa[0], setTwoFaEnabled = _twoFa[1];
  var _pending = React.useState(null); var pendingStep = _pending[0], setPendingStep = _pending[1];
  var _offered = React.useRef(false);

  function t(key, vars) { return window.BanheirosI18n.t(lang, key, vars); }

  function onLogin(u) {
    setUser(u); setLoggedIn(true); setTab("map");
    if (!_offered.current) { _offered.current = true; setPendingStep("twofaOffer"); }
  }
  function onLogout() { setLoggedIn(false); setSelectedId(null); setAddPinOpen(false); }
  function onToggleFavorite(id) {
    setFavorites(function (prev) {
      var next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function onUpdateUser(partial) { setUser(function (prev) { return Object.assign({}, prev, partial); }); }
  function onAddReview(bathroomId, review) {
    setBathrooms(function (prev) {
      return prev.map(function (b) {
        if (b.id !== bathroomId) return b;
        var newRatings = {};
        Object.keys(b.ratings).forEach(function (cat) {
          newRatings[cat] = (b.ratings[cat] * 2 + review.categoryRatings[cat]) / 3;
        });
        return Object.assign({}, b, { ratings: newRatings, reviews: [review].concat(b.reviews) });
      });
    });
  }

  var selectedBathroom = selectedId ? bathrooms.find(function (b) { return b.id === selectedId; }) : null;

  if (!loggedIn) {
    return React.createElement("div", { className: "app-shell" },
      React.createElement(window.Banheiros.AuthScreen, { t: t, lang: lang, onSetLang: setLang, onLogin: onLogin })
    );
  }

  if (pendingStep === "twofaOffer") {
    return React.createElement("div", { className: "app-shell" },
      React.createElement(window.Banheiros.TwoFaOffer, {
        t: t, onEnable: function () { setPendingStep("twofaEnroll"); }, onSkip: function () { setPendingStep(null); }
      })
    );
  }
  if (pendingStep === "twofaEnroll") {
    return React.createElement("div", { className: "app-shell" },
      React.createElement(window.Banheiros.TwoFaEnroll, {
        t: t, onConfirm: function () { setTwoFaEnabled(true); setPendingStep(null); }
      })
    );
  }

  var navItems = [
    { id: "map", label: t("nav.map"), icon: "mapPin" },
    { id: "favorites", label: t("nav.favorites"), icon: "star" },
    { id: "profile", label: t("nav.profile"), icon: "user" }
  ];

  return React.createElement("div", { className: "app-shell" },
    tab === "map" && React.createElement(window.Banheiros.MapScreen, {
      t: t, bathrooms: bathrooms, favorites: favorites, selectedId: selectedId,
      onSelectBathroom: setSelectedId, onOpenAddPin: function () { setAddPinOpen(true); }
    }),
    tab === "favorites" && React.createElement(window.Banheiros.FavoritesScreen, {
      t: t, bathrooms: bathrooms, favorites: favorites, onSelectBathroom: setSelectedId, onToggleFavorite: onToggleFavorite
    }),
    tab === "profile" && React.createElement(window.Banheiros.ProfileScreen, {
      t: t, lang: lang, onSetLang: setLang, user: user, onUpdateUser: onUpdateUser, onLogout: onLogout,
      twoFaEnabled: twoFaEnabled, onSetTwoFaEnabled: setTwoFaEnabled
    }),
    React.createElement("div", { className: "bottom-nav" },
      navItems.map(function (item) {
        return React.createElement("button", { key: item.id, className: "nav-item" + (tab === item.id ? " active" : ""), onClick: function () { setTab(item.id); } },
          React.createElement(Icon, { name: item.icon, size: 20 }),
          React.createElement("span", null, item.label)
        );
      })
    ),
    selectedBathroom && React.createElement(window.Banheiros.BathroomModal, {
      t: t, bathroom: selectedBathroom, isFavorite: favorites.has(selectedBathroom.id),
      onToggleFavorite: onToggleFavorite, onClose: function () { setSelectedId(null); },
      onAddReview: onAddReview, username: user.username, defaultShowUsername: user.defaultShowUsername
    }),
    addPinOpen && React.createElement(window.Banheiros.AddPinModal, { t: t, onClose: function () { setAddPinOpen(false); } })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BanheirosApp));
