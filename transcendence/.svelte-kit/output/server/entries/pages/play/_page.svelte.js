import { c as create_ssr_component, e as escape, v as validate_component } from "../../../chunks/index.js";
import "socket.io-client";
const Paddle_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ":root{font-size:17px}.paddle.svelte-1s7pihk{width:80px;height:12px;background-color:rgba(59, 17, 135, 0.5);border-radius:2em;position:relative;left:var(--pos)}",
  map: null
};
const Paddle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { gameWidth } = $$props;
  let { gameHeight } = $$props;
  let { paddleWidth } = $$props;
  let { pos } = $$props;
  if ($$props.gameWidth === void 0 && $$bindings.gameWidth && gameWidth !== void 0)
    $$bindings.gameWidth(gameWidth);
  if ($$props.gameHeight === void 0 && $$bindings.gameHeight && gameHeight !== void 0)
    $$bindings.gameHeight(gameHeight);
  if ($$props.paddleWidth === void 0 && $$bindings.paddleWidth && paddleWidth !== void 0)
    $$bindings.paddleWidth(paddleWidth);
  if ($$props.pos === void 0 && $$bindings.pos && pos !== void 0)
    $$bindings.pos(pos);
  $$result.css.add(css$1);
  return `<div class="${"paddle svelte-1s7pihk"}" style="${"--pos: " + escape(pos, true) + "px; --paddleWidth = " + escape(paddleWidth, true) + "px"}"></div>`;
});
const PaddleSize = {
  XSmall: 20,
  Small: 40,
  Medium: 80,
  Large: 130
};
class GameMap {
  constructor(mapWidth, mapHeight, paddleSize = PaddleSize.Medium, walls = []) {
    this.width = mapWidth;
    this.height = mapHeight;
    this.paddleSize = paddleSize;
    this.walls = [
      { startX: 0, startY: 0, endX: mapWidth, endY: 0 },
      { startX: 0, startY: 0, endX: 0, endY: mapHeight },
      { startX: mapWidth, startY: 0, endX: mapWidth, endY: mapHeight },
      { startX: 0, startY: mapHeight, endX: mapWidth, endY: mapHeight }
    ];
    this.walls.concat(walls);
  }
}
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ":root{font-size:17px}.container.svelte-8gae09{height:100%;display:flex;justify-content:center;align-items:center}.game-container.svelte-8gae09{width:var(--gameWidth);height:var(--gameHeight);padding:0;display:grid;grid-template-rows:4% 3% 80% 3% 4%}.bar-container-above.svelte-8gae09{position:relative;display:flex;align-items:center}.bar-container-below.svelte-8gae09{position:relative;display:flex;align-items:center}.central-line.svelte-8gae09{position:absolute;top:400px;width:500px;height:0;border:dashed 3px rgba(59, 17, 135, 0.3)}.beyond-above.svelte-8gae09{background-color:rgba(59, 17, 135, 0.3);border-radius:5em 5em 0 0}.beyond-below.svelte-8gae09{background-color:rgba(59, 17, 135, 0.3);border-radius:0 0 5em 5em}.map.svelte-8gae09{display:flex;background-color:rgba(59, 17, 135, 0.1)}.main-circle.svelte-8gae09{width:100%;aspect-ratio:1/1;border-radius:50%;background-color:rgba(255, 255, 255, 0.4)}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let gameMap = new GameMap(720, 800, PaddleSize.Medium);
  let oppoPos = (gameMap.width - gameMap.paddleSize) / 2;
  let myPos = (gameMap.height - gameMap.paddleSize) / 2;
  $$result.css.add(css);
  return `<div class="${"container svelte-8gae09"}"><div class="${"game-container svelte-8gae09"}" style="${"--gameWidth: " + escape(gameMap.width, true) + "px; --gameHeight: " + escape(gameMap.height, true) + "px;"}"><div class="${"beyond-above svelte-8gae09"}"></div>
		<div class="${"bar-container-above svelte-8gae09"}">${validate_component(Paddle, "Paddle").$$render(
    $$result,
    {
      pos: oppoPos,
      paddleWidth: gameMap.paddleSize,
      gameWidth: gameMap.width,
      gameHeight: gameMap.height
    },
    {},
    {}
  )}</div>
		<div class="${"map svelte-8gae09"}"><div class="${"main-circle  svelte-8gae09"}"></div></div>
		<div class="${"bar-container-below svelte-8gae09"}">${validate_component(Paddle, "Paddle").$$render(
    $$result,
    {
      pos: myPos,
      paddleWidth: gameMap.paddleSize,
      gameWidth: gameMap.width,
      gameHeight: gameMap.height
    },
    {},
    {}
  )}</div>
		<div class="${"beyond-below svelte-8gae09"}"></div></div>
	<div class="${"central-line svelte-8gae09"}"></div></div>

`;
});
export {
  Page as default
};
