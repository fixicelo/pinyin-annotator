import { useStorage } from "@plasmohq/storage/hook";
import {
  PronunciationSystem,
  StorageKey,
  ToneType
} from "~constants"

const titleChars = [
  { char: "拼", pinyin: "pīn", zhuyin: "ㄆㄧㄣˇ" },
  { char: "音", pinyin: "yīn", zhuyin: "ㄧㄣˇ" },
  { char: "標", pinyin: "biāo", zhuyin: "ㄅㄧㄠˇ" },
  { char: "註", pinyin: "zhù", zhuyin: "ㄓㄨˋ" },
  { char: "工", pinyin: "gōng", zhuyin: "ㄍㄨㄥˇ" },
  { char: "具", pinyin: "jù", zhuyin: "ㄐㄩˋ" }
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