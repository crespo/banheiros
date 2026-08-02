function MapIllustration() {
  return React.createElement("svg", { viewBox: "0 0 375 700", preserveAspectRatio: "xMidYMid slice" },
    React.createElement("rect", { x: 0, y: 0, width: 375, height: 700, fill: "var(--map-block)" }),
    React.createElement("path", { d: "M255 0 C300 120 260 220 300 320 C330 400 300 520 340 620 L375 620 L375 0 Z", fill: "var(--map-water)" }),
    React.createElement("path", { d: "M270 0 C310 110 275 210 312 300 C338 370 312 500 350 600", fill: "none", stroke: "var(--map-water-deep)", strokeWidth: 2, opacity: 0.4 }),
    React.createElement("path", { d: "M0 640 C40 610 90 630 110 670 C120 690 90 700 60 700 L0 700 Z", fill: "var(--map-water)" }),
    React.createElement("g", { opacity: 0.9 },
      [ [20,60,80,50],[115,70,70,60],[20,140,90,55],[125,150,80,50],[15,215,95,60],[125,215,75,55],
        [230,150,55,60],[15,300,90,55],[120,300,80,55],[210,270,55,50],[20,380,90,55],[120,380,75,55],
        [215,400,60,50],[20,460,85,55],[115,460,75,55],[215,470,55,55],[20,540,80,50],[115,540,70,50],
        [20,610,80,45],[115,610,70,45] ].map(function(b,i){
        return React.createElement("rect",{key:"blk"+i,x:b[0],y:b[1],width:b[2],height:b[3],rx:10,fill:"var(--map-block-line)",opacity:0.55});
      })
    ),
    React.createElement("path", { d: "M0 60 H375 M0 130 H230 M0 205 H230 M0 285 H230 M0 365 H375 M0 445 H230 M0 525 H230 M0 600 H375", stroke: "var(--color-bg)", strokeWidth: 6, opacity: 0.9 }),
    React.createElement("path", { d: "M110 0 V700 M225 0 V330 M225 400 V700", stroke: "var(--color-bg)", strokeWidth: 6, opacity: 0.9 }),
    React.createElement("path", { d: "M0 330 C90 300 180 340 260 300 C300 280 330 310 375 290", stroke: "var(--color-neutral-400)", strokeWidth: 4, fill: "none", strokeLinecap: "round" }),
    [ [55,95,26],[255,555,32],[70,470,22] ].map(function(p,i){
      return React.createElement("g",{key:"park"+i},
        React.createElement("circle",{cx:p[0],cy:p[1],r:p[2],fill:"var(--color-accent-2-200)"}),
        [[-8,-6],[7,4],[0,9],[-6,7]].map(function(o,j){
          return React.createElement("circle",{key:j,cx:p[0]+o[0],cy:p[1]+o[1],r:4,fill:"var(--color-accent-2-600)"});
        })
      );
    })
  );
}

function BanheirosPin(props) {
  var Icon = window.Banheiros.Icon;
  var meta = window.BanheirosData.CATEGORY_META[props.bathroom.category];
  var isFav = props.isFavorite;
  return React.createElement("button", {
    className: "pin" + (props.selected ? " selected" : ""),
    style: { left: props.bathroom.x + "%", top: props.bathroom.y + "%" },
    onClick: function () { props.onSelect(props.bathroom.id); },
    "aria-label": props.bathroom.name
  },
    React.createElement("div", { className: "pin-badge tone-" + meta.tone },
      React.createElement(Icon, { name: meta.icon, size: 17 }),
      meta.paid && React.createElement("div", { className: "pin-sub" }, React.createElement(Icon, { name: "dollarSign", size: 9 })),
      isFav && React.createElement("div", { className: "pin-fav" }, React.createElement(Icon, { name: "star", size: 9 }))
    )
  );
}

function BanheirosUserLocation(props) {
  return React.createElement("div", { className: "user-location " + props.mode, style: { left: props.x + "%", top: props.y + "%" } },
    React.createElement("span", { className: "user-location-halo" }),
    props.mode === "precise" && React.createElement("span", { className: "user-location-dot" })
  );
}

function BanheirosMapScreen(props) {
  var t = props.t;
  var Icon = window.Banheiros.Icon;
  var React_ = React;
  var _f = React_.useState("all"); var filter = _f[0], setFilter = _f[1];
  var _l = React_.useState(false); var legendOpen = _l[0], setLegendOpen = _l[1];
  var _q = React_.useState(""); var query = _q[0], setQuery = _q[1];
  var _loc = React_.useState("pending"); var locationMode = _loc[0], setLocationMode = _loc[1];
  var userPos = { x: 46, y: 50 }; // representative point; a real map centers its camera on true lat/lng here

  React_.useEffect(function () {
    var settled = false;
    var fallback = setTimeout(function () { if (!settled) { settled = true; setLocationMode("approximate"); } }, 4000);
    if (!navigator.geolocation) { clearTimeout(fallback); setLocationMode("approximate"); return; }
    navigator.geolocation.getCurrentPosition(
      function () { if (!settled) { settled = true; clearTimeout(fallback); setLocationMode("precise"); } },
      function () { if (!settled) { settled = true; clearTimeout(fallback); setLocationMode("approximate"); } },
      { timeout: 3800 }
    );
    return function () { clearTimeout(fallback); };
  }, []);

  var filters = [
    { id: "all", label: t("map.filterAll") },
    { id: "public", label: t("map.filterPublic") },
    { id: "instore", label: t("map.filterInstore") },
    { id: "paid", label: t("map.filterPaid") }
  ];

  var list = props.bathrooms.filter(function (b) {
    if (query && b.name.toLowerCase().indexOf(query.toLowerCase()) === -1 && b.address.toLowerCase().indexOf(query.toLowerCase()) === -1) return false;
    if (filter === "all") return true;
    if (filter === "paid") return b.category.indexOf("paid") !== -1;
    return b.category.indexOf(filter) === 0;
  });

  return React.createElement("div", { className: "map-screen", "data-screen-label": "Map" },
    React.createElement("div", { className: "map-canvas-wrap" },
      React.createElement("div", { className: "map-canvas" },
        React.createElement(MapIllustration, null),
        list.map(function (b) {
          return React.createElement(BanheirosPin, {
            key: b.id, bathroom: b, isFavorite: props.favorites.has(b.id),
            selected: props.selectedId === b.id, onSelect: props.onSelectBathroom
          });
        }),
        locationMode !== "pending" && React.createElement(BanheirosUserLocation, { mode: locationMode, x: userPos.x, y: userPos.y })
      )
    ),
    React.createElement("div", { className: "map-topbar" },
      React.createElement("div", { className: "search-row" },
        React.createElement("div", { className: "search-box" },
          React.createElement(Icon, { name: "search", size: 16 }),
          React.createElement("input", { placeholder: t("map.searchPlaceholder"), value: query, onChange: function (e) { setQuery(e.target.value); } })
        ),
        React.createElement("button", { className: "icon-btn-float", onClick: function () { setLegendOpen(!legendOpen); }, "aria-label": t("map.legendTitle") },
          React.createElement(Icon, { name: "filter", size: 16 })
        )
      ),
      React.createElement("div", { className: "chip-row" },
        filters.map(function (f) {
          return React.createElement("button", { key: f.id, className: "chip" + (filter === f.id ? " active" : ""), onClick: function () { setFilter(f.id); } }, f.label);
        })
      )
    ),
    legendOpen && React.createElement("div", { className: "legend-pop" },
      React.createElement("div", { className: "legend-row" }, React.createElement("span", { className: "legend-dot tone-accent" }, React.createElement(Icon, { name: "building2", size: 10 })), t("map.legendPublic")),
      React.createElement("div", { className: "legend-row" }, React.createElement("span", { className: "legend-dot tone-accent2" }, React.createElement(Icon, { name: "store", size: 10 })), t("map.legendInstore")),
      React.createElement("div", { className: "legend-row" }, React.createElement("span", { className: "legend-dot paid" }, React.createElement(Icon, { name: "dollarSign", size: 10 })), t("map.legendPaid")),
      React.createElement("div", { className: "legend-row" }, React.createElement("span", { className: "legend-dot fav" }, React.createElement(Icon, { name: "star", size: 10 })), t("map.legendFavorite")),
      React.createElement("div", { className: "legend-row" }, React.createElement("span", { className: "legend-dot you" }), t("map.legendYou"))
    ),
    React.createElement("button", { className: "fab", onClick: props.onOpenAddPin, "aria-label": t("map.addBathroom") },
      React.createElement(Icon, { name: "plus", size: 24 })
    )
  );
}

window.Banheiros = window.Banheiros || {};
Object.assign(window.Banheiros, { MapScreen: BanheirosMapScreen });
