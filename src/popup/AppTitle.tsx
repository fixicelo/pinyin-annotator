import Typography from "@mui/material/Typography";
import { useStorage } from "@plasmohq/storage/hook";
import { StorageKey, ToneType } from '~constants';

const AppTitle = () => {
  const [toneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol);
  const withTones = toneType === ToneType.Symbol;

  return (
    <Typography
      variant="h4"
      gutterBottom
      textAlign={'center'}
      style={{ fontFamily: "LXGW WenKai Mono" }}
    >
      {/* 
      <ruby>漢<rp>(</rp><rt>{withTones ? 'hàn' : 'han'}</rt><rp>)</rp></ruby>
      <ruby>語<rp>(</rp><rt>{withTones ? 'yǔ' : 'yu'}</rt><rp>)</rp></ruby> 
      */}
      <ruby>拼<rp>(</rp><rt>{withTones ? 'pīn' : 'pin'}</rt><rp>)</rp></ruby>
      <ruby>音<rp>(</rp><rt>{withTones ? 'yīn' : 'yin'}</rt><rp>)</rp></ruby>
      <ruby>標<rp>(</rp><rt>{withTones ? 'biāo' : 'biao'}</rt><rp>)</rp></ruby>
      <ruby>註<rp>(</rp><rt>{withTones ? 'zhù' : 'zhu'}</rt><rp>)</rp></ruby>
      <ruby>工<rp>(</rp><rt>{withTones ? 'gōng' : 'gong'}</rt><rp>)</rp></ruby>
      <ruby>具<rp>(</rp><rt>{withTones ? 'jù' : 'ju'}</rt><rp>)</rp></ruby>
    </Typography>
  )
}

export default AppTitle;