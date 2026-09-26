import { IconMonitor, IconMoon, IconSun } from './icons';
import { IconButton } from './Button';
import { THEME_LABEL, useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const Icon = theme === 'light' ? IconSun : theme === 'dark' ? IconMoon : IconMonitor;
  const next = theme === 'system' ? '浅色' : theme === 'light' ? '深色' : '跟随系统';

  return (
    <IconButton label={`主题：${THEME_LABEL[theme]}，点击切换为${next}`} onClick={cycle}>
      <Icon />
    </IconButton>
  );
}
