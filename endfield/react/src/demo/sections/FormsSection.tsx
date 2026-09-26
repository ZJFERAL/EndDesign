import { useState } from 'react';
import { Section, Demo } from '../Section';
import { Input, Select, Textarea, SearchBar } from '../../components/Input';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Misc';

export function FormsSection() {
  const [keyword, setKeyword] = useState('');

  return (
    <Section
      id="forms"
      eyebrow="Forms"
      title="表单控件"
      description="输入框、下拉、文本域与搜索框。全部支持受控与非受控两种用法。"
    >
      <div className="grid max-w-2xl gap-0">
        <Input label="用户名" placeholder="请输入用户名" hint="必填，4–20 个字符" />
        <Input label="邮箱" type="email" placeholder="you@example.com" />
        <Input label="禁用状态" defaultValue="不可编辑" disabled />
        <Select label="语言" defaultValue="zh">
          <option value="zh">简体中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </Select>
        <Textarea label="个人简介" placeholder="写点什么…" hint="最多 200 字" />
        <Input
          label="受控输入"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入试试"
          hint={`当前值：${keyword || '（空）'}`}
        />
      </div>

      <Divider />

      <Demo>
        <div className="w-96 max-w-full">
          <SearchBar
            placeholder="搜索组件…"
            aria-label="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <Button variant="primary">搜索</Button>
        <Button>重置</Button>
      </Demo>
    </Section>
  );
}
