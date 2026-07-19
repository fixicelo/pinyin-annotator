import { useStorage } from "@plasmohq/storage/hook";
import {
  PronunciationSystem,
  StorageKey,
  ToneType
} from "~constants"

const titleChars = [
  { char: "拼", pinyin: "pīn", zhuyin: "\u3106\u3127\u3123\u02C7" },
  { char: "音", pinyin: "yīn", zhuyin: "\u3127\u3123\u02C7" },
  { char: "標", pinyin: "biāo", zhuyin: "\u3105\u3127\u3120\u02C7" },
  { char: "註", pinyin: "zhù", zhuyin: "\u3113\u3128\u02CB" },
  { char: "工", pinyin: "gōng", zhuyin: "\u310D\u3128\u3125\u02C7" },
  { char: "具", pinyin: "jù", zhuyin: "\u3110\u3129\u02CB" }
]

const AppTitle = () => {
  const [toneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol)
  const [pronunciationSystem] = useStorage<PronunciationSystem>(
    StorageKey.pronunciationSystem,
    PronunciationSystem.Pinyin
  )
  const withTones = toneType === ToneType.Symbol
  const isZhuyin = pronunciationSystem === PronunciationSystem.Zhuyin

  return (
    <h2 className="title">
      {titleChars.map(({ char, pinyin, zhuyin }) => (
        <ruby key={char}>
          {char}
          <rp>(</rp>
          <rt>
            {isZhuyin ? zhuyin : withTones ? pinyin : pinyin.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]/g, (c) => {
              const map: Record<string, string> = {
                ā:'a', á:'a', ǎ:'a', à:'a',
                ō:'o', ó:'o', ǒ:'o', ò:'o',
                ē:'e', é:'e', ě:'e', è:'e',
                ī:'i', í:'i', ǐ:'i', ì:'i',
                ū:'u', ú:'u', ǔ:'u', ù:'u',
                ǖ:'ü', ǘ:'ü', ǚ:'ü', ǜ:'ü'
              }
              return map[c] ?? c
            })}
          </rt>
          <rp>)</rp>
        </ruby>
      ))}
    </h2>
  )
}

export default AppTitle