/**
 * The fixed Codex asset contract. No other image name may ever be referenced:
 * a file outside this list does not exist and the bundler would fail on it.
 */
export const assets = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  sprite1: require('../../assets/sprite_1.png'),
  sprite2: require('../../assets/sprite_2.png'),
  sprite3: require('../../assets/sprite_3.png'),
  sprite4: require('../../assets/sprite_4.png'),
  sprite5: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
};

/** sprite_1..4 are the four fish species, indexed 1-based by the species table. */
export const fishSprites = [assets.sprite1, assets.sprite2, assets.sprite3, assets.sprite4];

export function fishSprite(index: number) {
  return fishSprites[Math.max(0, Math.min(fishSprites.length - 1, index - 1))];
}
