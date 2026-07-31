import React, { useCallback, useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, UserAction, type UserPreferences } from "~constants"
import {
  ANNOTATION_SCALE_DEFAULT,
  ANNOTATION_SCALE_MARKS,
  ANNOTATION_SCALE_MAX,
  ANNOTATION_SCALE_MIN,
  ANNOTATION_SCALE_STEP,
  ANNOTATION_SCALE_TICKS,
  clampAnnotationScale,
  SCALE_TEXT_TOGETHER_DEFAULT,
  snapAnnotationScaleToStep
} from "~lib/annotation-scale"

interface AnnotationScalePreview {
  annotationScale: number
  scaleTextTogether: boolean
}

interface AnnotationScaleControlProps {
  communicateWithContentScript: (
    action: UserAction,
    data?: UserPreferences
  ) => void
  onPreviewChange?: (preview: AnnotationScalePreview) => void
  syncWithCurrentTab: boolean
}

const AnnotationScaleControl: React.FC<AnnotationScaleControlProps> = ({
  communicateWithContentScript,
  onPreviewChange,
  syncWithCurrentTab
}) => {
  const [annotationScale, setAnnotationScale] = useStorage<number>(
    StorageKey.annotationScale,
    ANNOTATION_SCALE_DEFAULT
  )
  const [scaleTextTogether, setScaleTextTogether] = useStorage<boolean>(
    StorageKey.scaleTextTogether,
    SCALE_TEXT_TOGETHER_DEFAULT
  )
  const [scaleTextTogetherTouched, setScaleTextTogetherTouched] =
    useStorage<boolean>(StorageKey.scaleTextTogetherTouched, false)
  const [draftScale, setDraftScale] = useState(() =>
    clampAnnotationScale(annotationScale)
  )
  const [draftScaleInput, setDraftScaleInput] = useState(() =>
    String(clampAnnotationScale(annotationScale))
  )
  const resolvedScaleTextTogether = scaleTextTogetherTouched
    ? scaleTextTogether
    : SCALE_TEXT_TOGETHER_DEFAULT
  const [draftScaleTextTogether, setDraftScaleTextTogether] = useState(
    resolvedScaleTextTogether
  )

  const getSliderPositionRatio = useCallback((value: number) => {
    return (
      (value - ANNOTATION_SCALE_MIN) /
      (ANNOTATION_SCALE_MAX - ANNOTATION_SCALE_MIN)
    )
  }, [])

  useEffect(() => {
    const normalizedScale = clampAnnotationScale(annotationScale)
    setDraftScale(normalizedScale)
    setDraftScaleInput(String(normalizedScale))
  }, [annotationScale])

  useEffect(() => {
    setDraftScaleTextTogether(resolvedScaleTextTogether)
  }, [resolvedScaleTextTogether])

  useEffect(() => {
    onPreviewChange?.({
      annotationScale: draftScale,
      scaleTextTogether: draftScaleTextTogether
    })
  }, [draftScale, draftScaleTextTogether, onPreviewChange])

  const commitPreferences = useCallback(
    (nextScale: number, nextScaleTextTogether: boolean) => {
      const normalizedScale = clampAnnotationScale(nextScale)
      const normalizedScaleTextTogether = Boolean(nextScaleTextTogether)

      if (normalizedScale !== annotationScale) {
        setAnnotationScale(normalizedScale)
      }

      if (normalizedScaleTextTogether !== scaleTextTogether) {
        setScaleTextTogether(normalizedScaleTextTogether)
      }
      if (!scaleTextTogetherTouched) {
        setScaleTextTogetherTouched(true)
      }

      if (
        syncWithCurrentTab &&
        (normalizedScale !== annotationScale ||
          normalizedScaleTextTogether !== scaleTextTogether ||
          !scaleTextTogetherTouched)
      ) {
        communicateWithContentScript(UserAction.UpdateOptions, {
          annotationScale: normalizedScale,
          scaleTextTogether: normalizedScaleTextTogether,
          scaleTextTogetherTouched: true
        })
      }
    },
    [
      annotationScale,
      communicateWithContentScript,
      scaleTextTogether,
      scaleTextTogetherTouched,
      setAnnotationScale,
      setScaleTextTogether,
      setScaleTextTogetherTouched,
      syncWithCurrentTab
    ]
  )

  const commitScaleInput = useCallback(() => {
    if (draftScaleInput.length === 0) {
      setDraftScaleInput(String(draftScale))
      return
    }

    const parsedValue = Number(draftScaleInput)
    const normalizedScale = clampAnnotationScale(parsedValue)

    setDraftScale(normalizedScale)
    setDraftScaleInput(String(normalizedScale))
    commitPreferences(normalizedScale, draftScaleTextTogether)
  }, [commitPreferences, draftScale, draftScaleInput, draftScaleTextTogether])

  const handleSliderChange = useCallback((nextValue: number) => {
    const snappedValue = snapAnnotationScaleToStep(nextValue)
    setDraftScale(snappedValue)
    setDraftScaleInput(String(snappedValue))
  }, [])

  const handleScaleTextTogetherChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked
      setDraftScaleTextTogether(isChecked)
      commitPreferences(draftScale, isChecked)
    },
    [commitPreferences, draftScale]
  )

  const handleReset = useCallback(() => {
    setDraftScale(ANNOTATION_SCALE_DEFAULT)
    setDraftScaleInput(String(ANNOTATION_SCALE_DEFAULT))
    setDraftScaleTextTogether(SCALE_TEXT_TOGETHER_DEFAULT)
    commitPreferences(ANNOTATION_SCALE_DEFAULT, SCALE_TEXT_TOGETHER_DEFAULT)
  }, [commitPreferences])

  return (
    <div className="card annotation-scale-card">
      <div className="annotation-scale-header">
        <div className="annotation-scale-heading">
          <div className="annotation-scale-title">Annotation size</div>
          <div className="annotation-scale-meta">
            {draftScaleTextTogether
              ? "Text + annotation scale together"
              : "Annotation only"}
          </div>
        </div>
        <div className="annotation-scale-actions">
          <div className="annotation-scale-input-wrap">
            <input
              className="input annotation-scale-input"
              inputMode="numeric"
              value={draftScaleInput}
              onChange={(event) =>
                setDraftScaleInput(event.target.value.replace(/[^\d]/g, ""))
              }
              onBlur={commitScaleInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitScaleInput()
                }
              }}
            />
            <span className="annotation-scale-unit">%</span>
          </div>
          <button
            className="btn btn-text annotation-scale-reset"
            disabled={
              draftScale === ANNOTATION_SCALE_DEFAULT &&
              draftScaleTextTogether === SCALE_TEXT_TOGETHER_DEFAULT
            }
            onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="annotation-scale-slider-wrap">
        <input
          className="annotation-scale-slider"
          type="range"
          min={ANNOTATION_SCALE_MIN}
          max={ANNOTATION_SCALE_MAX}
          step={ANNOTATION_SCALE_STEP}
          value={snapAnnotationScaleToStep(draftScale)}
          onChange={(event) => handleSliderChange(event.target.valueAsNumber)}
          onBlur={() => commitPreferences(draftScale, draftScaleTextTogether)}
          onKeyUp={() => commitPreferences(draftScale, draftScaleTextTogether)}
          onMouseUp={() =>
            commitPreferences(draftScale, draftScaleTextTogether)
          }
          onTouchEnd={() =>
            commitPreferences(draftScale, draftScaleTextTogether)
          }
        />
        <div className="annotation-scale-ticks" aria-hidden="true">
          {ANNOTATION_SCALE_TICKS.map((tick) => (
            <span
              key={tick}
              className={`annotation-scale-tick${
                ANNOTATION_SCALE_MARKS.includes(
                  tick as (typeof ANNOTATION_SCALE_MARKS)[number]
                )
                  ? " annotation-scale-tick-major"
                  : ""
              }`}
              style={{
                left: `calc((100% - var(--annotation-scale-thumb-size)) * ${getSliderPositionRatio(
                  tick
                )} + var(--annotation-scale-thumb-size) / 2)`
              }}
            />
          ))}
        </div>
        <div className="annotation-scale-marks" aria-hidden="true">
          {ANNOTATION_SCALE_MARKS.map((mark) => (
            <span
              key={mark}
              className="annotation-scale-mark"
              style={{
                left: `calc((100% - var(--annotation-scale-thumb-size)) * ${getSliderPositionRatio(
                  mark
                )} + var(--annotation-scale-thumb-size) / 2)`
              }}>
              {mark}%
            </span>
          ))}
        </div>
      </div>

      <label className="annotation-scale-toggle">
        <span className="annotation-scale-toggle-text">
          Scale text together
        </span>
        <span className="switch">
          <input
            type="checkbox"
            checked={draftScaleTextTogether}
            onChange={handleScaleTextTogetherChange}
          />
          <span className="switch-slider"></span>
        </span>
      </label>
    </div>
  )
}

export default AnnotationScaleControl
