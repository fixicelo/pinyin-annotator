import styled from "@emotion/styled"
import { useStorage } from "@plasmohq/storage/hook"
import {
  Alert,
  Card,
  ConfigProvider,
  Flex,
  Input,
  Layout,
  Select,
  Switch,
  Typography,
} from "antd"
import React, { useCallback, useEffect, useState } from "react"

import {
  PREDEFINED_DICT_LINK,
  RubyPosition,
  StorageKey,
  ToneType
} from "~constants"

import { debounce } from "./util"

const { Option } = Select
const { Title, Text, Link } = Typography
const { Content } = Layout

const Container = styled(Content)`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: #f5f7fa;
`

const StyledCard = styled(Card)`
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  border: none;
  margin-bottom: 24px;

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 0 24px;
  }

  .ant-card-body {
    padding: 24px;
  }
`

const SettingRow = styled(Flex)`
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`

const SettingLabel = styled.div`
  flex: 1;
  padding-right: 16px;
`

const SettingControl = styled.div`
  flex-shrink: 0;
`

const SectionTitle = styled(Title)`
  &.ant-typography {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 18px;
    font-weight: 600;
    color: #1f1f1f;
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Footer = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-bottom: 20px;
`

const SectionHeader = styled.div`
  margin-bottom: 16px;
`

const ShortcutContainer = styled.div`
  margin-bottom: 24px;
`

const ShortcutList = styled.ul`
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  padding-left: 20px;
  margin-top: 4px;
`

const SupportContainer = styled.div`
  /* margin-top: 24px; */
`

const SpacedDiv = styled.div`
  margin-top: 8px;
`

function Options() {
  const [toneType, setToneType] = useStorage<ToneType>(
    StorageKey.toneType,
    ToneType.Symbol
  )
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(
    StorageKey.observerEnabled,
    true
  )
  const [autoAnnotate, setAutoAnnotate] = useStorage<boolean>(
    StorageKey.autoAnnotate,
    false
  )
  const [ignoredNodes, setIgnoredNodes] = useStorage<string[]>(
    StorageKey.ignoredNodes,
    []
  )
  const [ignoredNodesInput, setIgnoredNodesInput] = useState(
    ignoredNodes.join(",")
  )
  const [notification, setNotification] = useState<string | null>(null)
  const [dictLinkEnabled, setDictLinkEnabled] = useStorage<boolean>(
    StorageKey.dictLinkEnabled,
    true
  )
  const [selectedDict, setSelectedDict] = useStorage<string>(
    StorageKey.selectedDict,
    PREDEFINED_DICT_LINK[0].site
  )
  const [customDictUrl, setCustomDictUrl] = useStorage<string>(
    StorageKey.customDictUrl,
    ""
  )
  const [rubyPosition, setRubyPosition] = useStorage<RubyPosition>(
    StorageKey.rubyPosition,
    RubyPosition.OVER
  )

  const handleToneTypeChange = (checked: boolean) => {
    setToneType(checked ? ToneType.Symbol : ToneType.None)
  }

  const handleObserverEnabledChange = (checked: boolean) => {
    setObserverEnabled(checked)
  }

  const handleAutoAnnotateChange = (checked: boolean) => {
    setAutoAnnotate(checked)
  }

  const debouncedSetIgnoredNodes = useCallback(
    debounce((newIgnoredNodesInput: string) => {
      const newIgnoredNodes = newIgnoredNodesInput
        .split(",")
        .map((node) => node.trim())
        .filter(Boolean)
      setIgnoredNodes(newIgnoredNodes)
      setNotification("Auto-saved")
      setTimeout(() => setNotification(null), 2000)
    }, 1000),
    []
  )

  const handleIgnoredNodesChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newIgnoredNodesInput = event.target.value.trim().toUpperCase()
    setIgnoredNodesInput(newIgnoredNodesInput)
    debouncedSetIgnoredNodes(newIgnoredNodesInput)
  }

  const handleDictLinkToggle = (checked: boolean) => {
    setDictLinkEnabled(checked)
  }

  const handleDictChange = (value: string) => {
    setSelectedDict(value)
  }

  const handleCustomDictUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomDictUrl(event.target.value)
  }

  const handleRubyPositionChange = (value: RubyPosition) => {
    setRubyPosition(value)
  }

  useEffect(() => {
    setIgnoredNodesInput(ignoredNodes.join(","))
  }, [ignoredNodes])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8
        }
      }}>
      <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        <Container>
          <Header>
            <Title level={2} style={{ margin: 0 }}>
              Pinyin Annotator
            </Title>
            <Text type="secondary">Configuration & Settings</Text>
          </Header>

          <StyledCard>
            <SectionTitle level={4}>General Settings</SectionTitle>
            
            <SettingRow align="center" justify="space-between">
              <SettingLabel>
                <Text strong>Monitor Mode</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Works with CC (subtitles) on video streaming platforms such as Netflix, Disney+, YouTube, and Bilibili.
                </Text>
              </SettingLabel>
              <SettingControl>
                <Switch
                  checked={observerEnabled}
                  onChange={handleObserverEnabledChange}
                />
              </SettingControl>
            </SettingRow>

            <SettingRow align="center" justify="space-between">
              <SettingLabel>
                <Text strong>Auto-Annotate</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Automatically annotate pinyin on every page load.
                </Text>
              </SettingLabel>
              <SettingControl>
                <Switch
                  checked={autoAnnotate}
                  onChange={handleAutoAnnotateChange}
                />
              </SettingControl>
            </SettingRow>
          </StyledCard>

          <StyledCard>
            <SectionTitle level={4}>Appearance</SectionTitle>

            <SettingRow align="center" justify="space-between">
              <SettingLabel>
                <Text strong>Tone Marks</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Show tone marks (ā á ǎ à) instead of numbers or no tones.
                </Text>
              </SettingLabel>
              <SettingControl>
                <Switch
                  checked={toneType === ToneType.Symbol}
                  onChange={handleToneTypeChange}
                />
              </SettingControl>
            </SettingRow>

            <SettingRow align="center" justify="space-between">
              <SettingLabel>
                <Text strong>Annotation Position</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Display pinyin above or below the characters.
                </Text>
              </SettingLabel>
              <SettingControl>
                <Select
                  value={rubyPosition}
                  onChange={handleRubyPositionChange}
                  style={{ width: 120 }}
                >
                  <Option value={RubyPosition.OVER}>Top</Option>
                  <Option value={RubyPosition.UNDER}>Bottom</Option>
                </Select>
              </SettingControl>
            </SettingRow>
          </StyledCard>

          <StyledCard>
            <SectionTitle level={4}>Dictionary</SectionTitle>

            <SettingRow align="center" justify="space-between">
              <SettingLabel>
                <Text strong>Dictionary Link</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Add a link to an online dictionary for each word in the "Selected Text" area.
                </Text>
              </SettingLabel>
              <SettingControl>
                <Switch
                  checked={dictLinkEnabled}
                  onChange={handleDictLinkToggle}
                />
              </SettingControl>
            </SettingRow>

            {dictLinkEnabled && (
              <>
                <SettingRow align="center" justify="space-between">
                  <SettingLabel>
                    <Text strong>Select Dictionary</Text>
                  </SettingLabel>
                  <SettingControl>
                    <Select
                      value={selectedDict}
                      onChange={handleDictChange}
                      style={{ width: 200 }}
                    >
                      {PREDEFINED_DICT_LINK.map((dict) => (
                        <Option key={dict.site} value={dict.site}>
                          {dict.desc}
                        </Option>
                      ))}
                    </Select>
                  </SettingControl>
                </SettingRow>

                {selectedDict === "custom" && (
                  <SettingRow align="center" justify="space-between">
                    <SettingLabel>
                      <Text strong>Custom Dictionary URL</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Use {"{word}"} as a placeholder.
                      </Text>
                    </SettingLabel>
                    <SettingControl style={{ width: "50%" }}>
                      <Input
                        value={customDictUrl}
                        onChange={handleCustomDictUrlChange}
                        placeholder="https://example.com/dict/{word}"
                      />
                    </SettingControl>
                  </SettingRow>
                )}
                
                {selectedDict !== "custom" && (
                   <SettingRow align="center" justify="space-between">
                    <SettingLabel>
                      <Text strong>Current URL Pattern</Text>
                    </SettingLabel>
                    <SettingControl>
                      <Text type="secondary" copyable>
                        {PREDEFINED_DICT_LINK.find(dict => dict.site === selectedDict)?.url}
                      </Text>
                    </SettingControl>
                   </SettingRow>
                )}
              </>
            )}
          </StyledCard>

          <StyledCard>
            <SectionTitle level={4}>Shortcuts</SectionTitle>
            
            <ShortcutContainer>
              <Text strong>Keyboard Shortcuts</Text>
              <SpacedDiv>
                <Text type="secondary">
                  Default: <Text keyboard>Alt</Text> + <Text keyboard>Shift</Text> + <Text keyboard>P</Text>
                </Text>
              </SpacedDiv>
              <SpacedDiv>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  To customize, visit:
                </Text>
                <ShortcutList>
                  <li>Chrome/Edge: <Text code>chrome://extensions/shortcuts</Text></li>
                  <li>Firefox: <Text code>about:addons</Text> {">"} Gear Icon {">"} Manage Extension Shortcuts</li>
                </ShortcutList>
              </SpacedDiv>
            </ShortcutContainer>
          </StyledCard>

          <StyledCard>
            <SectionTitle level={4}>Support</SectionTitle>

            <SupportContainer>
              <Text strong>Feedback & Bug Report</Text>
              <br />
              <Text type="secondary">
                Found a bug or have a feature request? 
                <Link 
                  href="https://github.com/fixicelo/pinyin-annotator/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: 4 }}
                >
                  Visit our GitHub repository
                </Link>
              </Text>
            </SupportContainer>
          </StyledCard>

          <StyledCard>
            <SectionTitle level={4}>Advanced</SectionTitle>
            
            <SectionHeader>
              <Text strong>Ignored Tags</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Enter the tag names of nodes to ignore (separated by commas).
              </Text>
            </SectionHeader>
            
            <Input.TextArea
              value={ignoredNodesInput}
              onChange={handleIgnoredNodesChange}
              placeholder="TEXTAREA,CODE,PRE,KBD,INPUT,RP,RT,RUBY,SCRIPT,STYLE"
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
            {notification && (
              <Alert
                message={notification}
                type="success"
                showIcon
                style={{ marginTop: 12 }}
              />
            )}
          </StyledCard>
          
          <Footer>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Pinyin Annotator © {new Date().getFullYear()}
            </Text>
          </Footer>
        </Container>
      </Layout>
    </ConfigProvider>
  )
}

export default Options