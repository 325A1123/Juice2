import { Track } from '../types/music';

// Generated artwork paths
export const JUICE_HERO_COVER = '/src/assets/images/juice_hero_cover_1792126865368.jpg';
export const ACAI_OVERDRIVE_COVER = '/src/assets/images/album_acai_overdrive_1792126866134.jpg';
export const DESERT_LOOP_COVER = '/src/assets/images/album_desert_loop_1792126866300.jpg';
export const STUDIO_BANNER = '/src/assets/images/juice_studio_banner_1792126866495.jpg';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-juice-theme',
    title: 'JUICE (アサイーの渇き)',
    artist: 'JUICE COLLECTIVE ft. SUNFIRE',
    album: 'OVERHEAT EP',
    coverUrl: JUICE_HERO_COVER,
    duration: 38,
    bpm: 105,
    genre: 'Urban Hip-Hop / Neo-Funk',
    year: '2026',
    synthesizerPreset: 'juice_theme',
    description: '照りつける太陽と砂漠のような都市の渇きを、未知領域のジュースとアサイーでぶち破るアンセムチューン。',
    lyrics: [
      { id: 'l1', time: 0.5, text: 'Yeah...', subText: 'Intro groove drops' },
      { id: 'l2', time: 2.0, text: '照りつける太陽に オーバーヒートしてく体温', subText: 'Blazing sun overheating my core body heat' },
      { id: 'l3', time: 6.0, text: '人混みの熱気に巻かれて カラカラの喉', subText: 'Engulfed by city crowd heat, throat bone-dry' },
      { id: 'l4', time: 10.5, text: '砂漠のフロンティア 思考はループ', subText: 'Desert frontier, thoughts stuck in a loop' },
      { id: 'l5', time: 13.5, text: '抜け出せないこの悪態', subText: 'Cannot break out of this frustration' },
      { id: 'l6', time: 16.0, text: '渇きを癒すトリガーを欲してる', subText: 'Craving the trigger to quench this deep thirst' },
      { id: 'l7', time: 18.2, text: 'Huh, eh!', subText: 'Get ready' },
      { id: 'l8', time: 19.5, text: 'そこへ行くマイフレンズ 今すぐこれ飲み干してみな', subText: 'Hey my friends over there, drink this right now' },
      { id: 'l9', time: 23.5, text: '限界超えたその渇きに 未知領域のジュース', subText: 'For thirst beyond limits: Juice of the unknown realm' },
      { id: 'l10', time: 27.0, text: 'ぶち込もうぜ Pouring, pouring', subText: "Pour it in, pouring it down!" },
      { id: 'l11', time: 30.0, text: '五感ごと全部飲み込んで', subText: 'Swallowing it down with all five senses' },
      { id: 'l12', time: 32.5, text: '納得行くまで Juice, Juice...', subText: 'Until pure satisfaction: Juice, Juice...' },
      { id: 'l13', time: 35.0, text: 'アサイーのさ、アサイーのさ', subText: 'Acai elixir, cold and wild' }
    ]
  },
  {
    id: 'track-desert-loop',
    title: 'Desert Loop (砂漠のフロンティア)',
    artist: 'JUICE SOUNDSYSTEM',
    album: 'OBLIVION DRIVE',
    coverUrl: DESERT_LOOP_COVER,
    duration: 44,
    bpm: 90,
    genre: 'Desert Lo-Fi Chillhop',
    year: '2026',
    synthesizerPreset: 'desert_loop',
    description: '蜃気楼のように揺らめくエレピとスモーキーなアナログドラム。熱波のハイウェイを流すメロウトラック。',
    lyrics: [
      { id: 'dl1', time: 0.0, text: '「砂漠のフロンティア 思考はループ」', subText: 'Desert Frontier - Endless Loops' },
      { id: 'dl2', time: 6.0, text: '遠くかすむ蜃気楼 アナログの針音', subText: 'Distant mirage shimmering through vinyl hiss' },
      { id: 'dl3', time: 15.0, text: '喉を潤す一滴のオアシス', subText: 'Single drops of oasis awakening the mind' },
      { id: 'dl4', time: 26.0, text: '渇いたアスファルトを染める紫の残響', subText: 'Purple echoes painting the dry asphalt' },
      { id: 'dl5', time: 36.0, text: 'チルアウト・セッション フェードアウト', subText: 'Smooth nocturnal fadeout' }
    ]
  },
  {
    id: 'track-acai-overdrive',
    title: 'Acai Overdrive (深夜未踏域)',
    artist: 'NEON VOID x JUICE',
    album: 'NEON VOID (TOKYO 2026)',
    coverUrl: ACAI_OVERDRIVE_COVER,
    duration: 40,
    bpm: 122,
    genre: 'Future Funk / Tokyo Club',
    year: '2026',
    synthesizerPreset: 'neon_void',
    description: '凍てつくアサイーとスパークリングなシンセブラスが炸裂する、深夜の渋谷・六本木フロアチューン。',
    lyrics: [
      { id: 'ao1', time: 0.0, text: 'Midnight Tokyo - Neon frequency check', subText: 'Shibuya underground sub frequency' },
      { id: 'ao2', time: 5.0, text: '未知領域のジュース ぶち込もうぜ', subText: 'Injecting unknown juice into the bloodstream' },
      { id: 'ao3', time: 14.0, text: 'Pouring, pouring - 光るネオンの氷晶', subText: 'Pouring crystals reflecting laser violet light' },
      { id: 'ao4', time: 24.0, text: '五感全部スパークする Acai Rush!', subText: 'Full 5-sense sensory overload: Acai Rush' },
      { id: 'ao5', time: 34.0, text: '納得行くまで 踊り明かせ Juice!', subText: 'Dance until dawn with pure Juice' }
    ]
  },
  {
    id: 'track-sunfire-overheat',
    title: 'Sunfire Overheat (体温限界突破)',
    artist: 'JUICE & HYPERFLOW',
    album: 'OVERHEAT EP',
    coverUrl: JUICE_HERO_COVER,
    duration: 36,
    bpm: 132,
    genre: 'Trap / Jersey Club Bounce',
    year: '2026',
    synthesizerPreset: 'overheat',
    description: '高速キック連打とスライド808サブベース。体温限界突破のハイパワードライブ。',
    lyrics: [
      { id: 'so1', time: 0.0, text: 'オーバーヒートしてく体温 限界点到達', subText: 'Body heat rising past the red line' },
      { id: 'so2', time: 7.0, text: 'カラカラの喉に 氷冷アサイーショット', subText: 'Ice cold acai shot down the burning throat' },
      { id: 'so3', time: 16.0, text: 'Bounce! Drop the 808 into the heatwave', subText: 'Bassline earthquake hitting the concrete' },
      { id: 'so4', time: 27.0, text: 'Pour it loud, quench the flame!', subText: 'Drink the ultimate juice remedy' }
    ]
  }
];
