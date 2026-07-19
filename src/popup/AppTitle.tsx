import { useStorage } from "@plasmohq/storage/hook";
import { StorageKey, ToneType } from '~constants';

const AppTitle = () => {
  const [toneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol);
  const withTones = toneType === ToneType.Symbol;

  return (
    <h2 className="title">
      <ruby>拼<rp>(</rp><rt>{withTones ? 'pīn' : 'pin'}</rt><rp>)</rp></ruby>
      <ruby>音<rp>(</rp><rt>{withTones ? 'yīn' : 'yin'}</rt><rp>)</rp></ruby>
      <ruby>標<rp>(</rp><rt>{withTones ? 'biāo' : 'biao'}</rt><rp>)</rp></ruby>
      <ruby>註<rp>(</rp><rt>{withTones ? 'zhù' : 'zhu'}</rt><rp>)</rp></ruby>
      <ruby>工<rp>(</rp><rt>{withTones ? 'gōng' : 'gong'}</rt><rp>)</rp></ruby>
      <ruby>具<rp>(</rp><rt>{withTones ? 'jù' : 'ju'}</rt><rp>)</rp></ruby>
    </h2>
  )
}

export default AppTitle;