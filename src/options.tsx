import { useStorage } from "@plasmohq/storage/hook";
import { Alert, Card, Col, Divider, Form, Input, Row, Select, Switch, Tooltip, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { PREDEFINED_DICT_LINK, RubyPosition, StorageKey, ToneType } from '~constants';
import { debounce } from './util';

const { Option } = Select;
const { Title, Text } = Typography;

function Options() {
  const [toneType, setToneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol);
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(StorageKey.observerEnabled, true);
  const [ignoredNodes, setIgnoredNodes] = useStorage<string[]>(StorageKey.ignoredNodes, []);
  const [ignoredNodesInput, setIgnoredNodesInput] = useState(ignoredNodes.join(','));
  const [notification, setNotification] = useState<string | null>(null);
  const [dictLinkEnabled, setDictLinkEnabled] = useStorage<boolean>(StorageKey.dictLinkEnabled, true);
  const [selectedDict, setSelectedDict] = useStorage<string>(StorageKey.selectedDict, PREDEFINED_DICT_LINK[0].site);
  const [customDictUrl, setCustomDictUrl] = useStorage<string>(StorageKey.customDictUrl, "");
  const [rubyPosition, setRubyPosition] = useStorage<RubyPosition>(StorageKey.rubyPosition, RubyPosition.OVER);

  const handleToneTypeChange = (checked: boolean) => {
    setToneType(checked ? ToneType.Symbol : ToneType.None);
  };

  const handleObserverEnabledChange = (checked: boolean) => {
    setObserverEnabled(checked);
  };

  const debouncedSetIgnoredNodes = useCallback(
    debounce((newIgnoredNodesInput: string) => {
      const newIgnoredNodes = newIgnoredNodesInput.split(',').map(node => node.trim()).filter(Boolean);
      setIgnoredNodes(newIgnoredNodes);
      setNotification('Auto-saved');
      setTimeout(() => setNotification(null), 2000);
    }, 1000),
    []
  );

  const handleIgnoredNodesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIgnoredNodesInput = event.target.value.trim().toUpperCase();
    setIgnoredNodesInput(newIgnoredNodesInput);
    debouncedSetIgnoredNodes(newIgnoredNodesInput);
  };

  const handleDictLinkToggle = (checked: boolean) => {
    setDictLinkEnabled(checked);
  };

  const handleDictChange = (value: string) => {
    setSelectedDict(value);
  };

  const handleCustomDictUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDictUrl(event.target.value);
  };

  const handleRubyPositionChange = (value: RubyPosition) => {
    setRubyPosition(value);
  };

  useEffect(() => {
    setIgnoredNodesInput(ignoredNodes.join(','));
  }, [ignoredNodes]);

  return (
    <div style={{ padding: '5% 25%' }}>
      <Card>
        <Title level={3} style={{ marginBottom: 30 }}>
          Pinyin Annotator Options
        </Title>
        <Form layout="vertical">
          <Form.Item>
            <Tooltip title="Monitor mode works with CC (subtitles) on video streaming platforms such as Netflix, Disney+, YouTube, and Bilibili.">
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <Text style={{ fontFamily: "LXGW WenKai Mono" }}>Monitor mode</Text>
                </Col>
                <Col className="gutter-row" span={2}>
                  <Switch checked={observerEnabled} onChange={(checked) => handleObserverEnabledChange(checked)} />
                </Col>
              </Row>
            </Tooltip>
          </Form.Item>

          <Form.Item>

            <Tooltip title="tone marks (ā á ǎ à) v.s. no tone mark (a a a a)">
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <Text style={{ fontFamily: "LXGW WenKai Mono" }}>Tone marks (ā á ǎ à)</Text>
                </Col>
                <Col className="gutter-row" span={2}>
                  <Switch checked={toneType === ToneType.Symbol} onChange={(checked) => handleToneTypeChange(checked)} />
                </Col>
              </Row>
            </Tooltip>
          </Form.Item>

          <Form.Item>
            <Tooltip title="Add a link to an online dictionary for each word in `Selected Text` area.">
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <Text style={{ fontFamily: "LXGW WenKai Mono" }}>Dictionary Link</Text>
                </Col>
                <Col className="gutter-row" span={2}>
                  <Switch checked={dictLinkEnabled} onChange={(checked) => handleDictLinkToggle(checked)} />
                </Col>
              </Row>
            </Tooltip>
          </Form.Item>

          <Form.Item label="Annotation Position">
            <Select value={rubyPosition} onChange={handleRubyPositionChange}>
              <Option value={RubyPosition.OVER}>Top</Option>
              <Option value={RubyPosition.UNDER}>Bottom</Option>
            </Select>
          </Form.Item>

          {dictLinkEnabled && (
            <>
              <Form.Item label="Select Dictionary">
                <Select value={selectedDict} onChange={handleDictChange}>
                  {PREDEFINED_DICT_LINK.map((dict) => (
                    <Option key={dict.site} value={dict.site}>
                      {dict.desc}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {selectedDict === "custom"
                ? (
                  <Form.Item label="Custom Dictionary URL">
                    <Input
                      value={customDictUrl}
                      onChange={handleCustomDictUrlChange}
                      placeholder="Use {word} as a placeholder for the selected word"
                    />
                  </Form.Item>
                )
                : (
                  <Text type="secondary">
                    Dictionary URL: {PREDEFINED_DICT_LINK.find(dict => dict.site === selectedDict)?.url}
                  </Text>
                )}
            </>
          )}

          <Title level={5} type="secondary">
            Advanced options
          </Title>
          <Form.Item label="Enter the tag names of nodes to ignore (separated by commas)">
            <Input
              value={ignoredNodesInput}
              onChange={handleIgnoredNodesChange}
              placeholder="Leave blank to use the default: TEXTAREA,CODE,PRE,KBD,INPUT,RP,RT,RUBY,SCRIPT,STYLE"
            />
            {notification && (
              <Alert message={notification} type="success" showIcon style={{ marginTop: 16 }} />
            )}
          </Form.Item>

          <Divider />

          <Title level={5} type="secondary">
            Shortcut
          </Title>
          <Text>
            To override the default keyboard shortcut (`Alt/Option` + `Shift` + `P`) for toggling annotations, visit your browser's extension shortcuts settings page:
          </Text>
          <ul>
            <li>
              For Chromium-based browsers (Chrome, Edge): visit <kbd>chrome://extensions/shortcuts</kbd>
            </li>
            <li>
              For Firefox: visit <kbd>about:addons</kbd>, click the gear button ⚙️, then select <strong>Manage Extension Shortcuts</strong>.
            </li>
          </ul>

          <Title level={5} type="secondary">
            Support
          </Title>
          <Text>
            If you have any feature requests or bug reports, please visit our <a href="https://github.com/fixicelo/pinyin-annotator/issues" target="_blank" rel="noreferrer">GitHub repository</a>.
          </Text>
        </Form>
      </Card>
    </div>
  );
}

export default Options;