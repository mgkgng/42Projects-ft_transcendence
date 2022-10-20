import { c as create_ssr_component, e as escape, v as validate_component, d as each, f as add_attribute } from "../../chunks/index.js";
import { io } from "socket.io-client";
const app = "";
const RoundButton_svelte_svelte_type_style_lang = "";
const css$5 = {
  code: ':root{font-size:17px}@keyframes svelte-12izcao-rotate{from{transform:rotate(var(--from1)) translateX(350px) rotate(var(--to1))}to{transform:rotate(var(--from2)) translateX(350px) rotate(var(--to2))}}.circle-button.svelte-12izcao.svelte-12izcao{position:absolute;top:40%;left:43%;background-color:rgba(0, 0, 0, 0.9);width:100px;aspect-ratio:1/1;border-radius:50%;padding-bottom:0.3em;display:flex;justify-content:center;align-items:center;animation-name:svelte-12izcao-rotate;animation-duration:40s;animation-iteration-count:infinite;animation-timing-function:linear;cursor:pointer}.circle-button.svelte-12izcao h2.svelte-12izcao{background-color:rgba(0, 0, 0, 0);font-family:"modernism-narrow";color:rgba(255, 255, 255, 0.85);user-select:none}.circle-button.svelte-12izcao.svelte-12izcao:hover{transition:0.4s;background-color:rgba(59, 17, 135, 0.2)}',
  map: null
};
const RoundButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { circleRadius: circleRadius2 } = $$props;
  let { showMessage } = $$props;
  let { message } = $$props;
  let angleLogin = [], anglePlay = [];
  if ($$props.circleRadius === void 0 && $$bindings.circleRadius && circleRadius2 !== void 0)
    $$bindings.circleRadius(circleRadius2);
  if ($$props.showMessage === void 0 && $$bindings.showMessage && showMessage !== void 0)
    $$bindings.showMessage(showMessage);
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  $$result.css.add(css$5);
  return `<div><div class="${"circle-button svelte-12izcao"}" style="${"--from1: " + escape(angleLogin[0], true) + "deg; --to1: " + escape(angleLogin[1], true) + "deg; --from2: " + escape(angleLogin[2], true) + "deg; --to2: " + escape(angleLogin[3], true) + "deg"}"><h2 class="${"svelte-12izcao"}">Login</h2></div>
	<div class="${"circle-button svelte-12izcao"}" style="${"--from1: " + escape(anglePlay[0], true) + "deg; --to1: " + escape(anglePlay[1], true) + "deg; --from2: " + escape(anglePlay[2], true) + "deg; --to2: " + escape(anglePlay[3], true) + "deg"}"><h2 class="${"svelte-12izcao"}">Play</h2></div></div>`;
});
const MainCircle_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: ":root{font-size:17px}.main-circle.svelte-5n3hta{position:relative;width:var(--width);background-color:#000;aspect-ratio:1/1;border-radius:50%;display:flex;justify-content:center;align-items:center;box-shadow:0px 0px 750px 100px rgb(59, 17, 135)}",
  map: null
};
const MainCircle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { circleRadius: circleRadius2 } = $$props;
  if ($$props.circleRadius === void 0 && $$bindings.circleRadius && circleRadius2 !== void 0)
    $$bindings.circleRadius(circleRadius2);
  $$result.css.add(css$4);
  return `<div class="${"main-circle svelte-5n3hta"}" style="${"--width: " + escape(circleRadius2 * 2, true) + "px"}"></div>`;
});
const Title_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: ":root{font-size:17px}.container.svelte-1y2t5hg{display:flex;align-items:center;justify-content:center;height:100%}@keyframes svelte-1y2t5hg-rotate{from{transform:rotate(var(--angle)) translateX(var(--dist)) rotate(var(--angle))}to{transform:rotate(var(--angle2)) translateX(var(--dist)) rotate(var(--angle2))}}.circle-around.svelte-1y2t5hg{position:absolute;top:44%;left:50%;right:0;width:var(--size);aspect-ratio:1/1;border-radius:50%;background-color:#000;animation-name:svelte-1y2t5hg-rotate;animation-duration:var(--duration);animation-iteration-count:infinite;animation-timing-function:linear}.title.svelte-1y2t5hg{position:absolute;background-color:rgba(0, 0, 0, 0);margin:2em;padding:0.3em 0 0.1em;font-size:75px;text-align:center;color:white;user-select:none}@keyframes svelte-1y2t5hg-show-msg{0%{color:#000}50%{transform:#fff}100%{transform:#000}}.msg.svelte-1y2t5hg{background-color:rgba(0, 0, 0, 0);animation-play-state:paused;animation-name:svelte-1y2t5hg-show-msg;animation-duration:3s}",
  map: null
};
let circleRadius = 250;
const Title = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  io();
  let { darkMode = false } = $$props;
  let circlesAround = [];
  let showMessage = false;
  let message = "";
  if ($$props.darkMode === void 0 && $$bindings.darkMode && darkMode !== void 0)
    $$bindings.darkMode(darkMode);
  $$result.css.add(css$3);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="${"container svelte-1y2t5hg"}">${validate_component(MainCircle, "MainCircle").$$render($$result, { circleRadius }, {}, {})}

	${each(circlesAround, (circleInfo) => {
      return `<div class="${"circle-around svelte-1y2t5hg"}" style="${"--dist: " + escape(circleRadius + 45, true) + "px; --startY: " + escape(circleInfo.y, true) + "px; --size: " + escape(circleInfo.size, true) + "px; --duration: " + escape(circleInfo.duration, true) + "s; --angle: " + escape(circleInfo.angle, true) + "deg; --angle2: " + escape(circleInfo.angle + 360, true) + "deg"}"></div>`;
    })}
	${validate_component(RoundButton, "RoundButton").$$render(
      $$result,
      { circleRadius, showMessage, message },
      {
        showMessage: ($$value) => {
          showMessage = $$value;
          $$settled = false;
        },
        message: ($$value) => {
          message = $$value;
          $$settled = false;
        }
      },
      {}
    )}
	<h1 class="${"title svelte-1y2t5hg"}">transcendence</h1>
	<div class="${"msg svelte-1y2t5hg"}">${escape(message)}</div></div>`;
  } while (!$$settled);
  return $$rendered;
});
const LightBar_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ":root{font-size:17px}.light-bar.svelte-z1igax{position:relative;left:var(--posX);width:150px;height:10px;border-radius:5rem;background-color:rgba(255, 255, 255, 0.5);box-shadow:0px -40px 80px 40px rgba(59, 17, 135, 0.6);translate:0.5s}",
  map: null
};
const LightBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let posX = 800;
  $$result.css.add(css$2);
  return `<div class="${"light-bar svelte-z1igax"}" style="${"--posX: " + escape(posX, true) + "px"}"></div>

`;
});
const Navbar_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ":root{font-size:17px}.nav-bar.svelte-5cpgll.svelte-5cpgll{display:grid;height:100%;grid-template-rows:50% 5%;padding:0 2em}.menus.svelte-5cpgll.svelte-5cpgll{display:flex;flex-direction:row;height:100%;justify-content:center;gap:2em}.menus.svelte-5cpgll .menu.svelte-5cpgll{font-size:28px;letter-spacing:0.75px;color:var(--col);opacity:0.2;transition:0.4s;user-select:none}.menus.svelte-5cpgll .menu.svelte-5cpgll:hover{transform:translateY(-15px);opacity:0.9}",
  map: null
};
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let col;
  let { darkMode } = $$props;
  if ($$props.darkMode === void 0 && $$bindings.darkMode && darkMode !== void 0)
    $$bindings.darkMode(darkMode);
  $$result.css.add(css$1);
  col = darkMode ? "#fff" : "#222222";
  return `<div class="${"nav-bar svelte-5cpgll"}"><div class="${"menus svelte-5cpgll"}" style="${"--col: " + escape(col, true)}"><div class="${"menu svelte-5cpgll"}">Menu1</div>
		<div class="${"menu svelte-5cpgll"}">Menu2</div>
		<div class="${"menu svelte-5cpgll"}">About</div>
		<div class="${"menu svelte-5cpgll"}">Menu3</div>
		<div class="${"menu svelte-5cpgll"}">Menu4</div></div>
	${validate_component(LightBar, "LightBar").$$render($$result, {}, {}, {})}</div>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ":root{font-size:17px}main.svelte-1d6wxb0{padding:0;display:grid;height:100vh;grid-template-rows:90vh 10vh;gap:0;padding:0;background-color:var(--col)}@keyframes svelte-1d6wxb0-size-change{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}.color-change-circle.svelte-1d6wxb0{position:absolute;bottom:-40px;left:-40px;width:80px;aspect-ratio:1/1;border-radius:50%;cursor:pointer;animation-name:svelte-1d6wxb0-size-change;animation-duration:3.5s;animation-iteration-count:infinite;animation-timing-function:linear;overflow:hidden}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let darkMode = false;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<main${add_attribute(
      "style",
      darkMode ? "background-color: #000" : "background-color: #fff",
      0
    )} class="${"svelte-1d6wxb0"}"><div class="${"color-change-circle svelte-1d6wxb0"}"${add_attribute(
      "style",
      darkMode ? "background-color: rgba(255, 255, 255, .9)" : "background-color: rgba(0, 0, 0, .9)",
      0
    )}></div>

	${validate_component(Title, "Title").$$render($$result, {}, {}, {})}
	${validate_component(Navbar, "Navbar").$$render(
      $$result,
      { darkMode },
      {
        darkMode: ($$value) => {
          darkMode = $$value;
          $$settled = false;
        }
      },
      {}
    )}</main>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
