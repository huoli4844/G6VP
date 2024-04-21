import { GIConfig } from '@antv/gi-sdk';
import { produce } from 'immer';
import localforage from 'localforage';
import React from 'react';
import $i18n from '../../i18n';

//@ts-ignore
window.localforage = localforage;
interface ThemeVars {
  id: string;
  name: string;
  textColor: string;
  backgroundColor: string;
}

const THEME_VARS = {
  light: {
    id: 'light',
    name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.FreshBlue', dm: '清新蓝' }),
    textColor: '#000',
    backgroundColor: '#fff',
  },
  ali: {
    id: 'ali',
    name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.WarmSunOrange', dm: '暖阳橙' }),
    textColor: '#000',
    backgroundColor: '#fff',
  },
  green: {
    id: 'ali',
    name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.MangoGreen', dm: '芒种绿' }),
    textColor: '#000',
    backgroundColor: '#fff',
  },
  dark: {
    id: 'dark',
    name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.DarkNightBlack', dm: '暗夜黑' }),
    textColor: '#fff',
    backgroundColor: '#1f1f1f',
  },
};
const getConfigByTheme = (config: GIConfig, themeValue): GIConfig => {
  try {
    const themeVars = THEME_VARS[themeValue] as ThemeVars;
    return produce(config, draft => {
      draft.nodes.forEach(itemCfg => {
        if (itemCfg.props.advanced) {
          itemCfg.props.advanced.label.fill = themeVars.textColor;
        } else {
          itemCfg.props.advanced = {
            label: {
              fill: themeVars.textColor,
            },
          };
        }
      });
      draft.edges.forEach(itemCfg => {
        if (itemCfg.props.advanced) {
          if (itemCfg.props.advanced.label.backgroundEnable) {
            itemCfg.props.advanced.label.backgroundFill = themeVars.backgroundColor;
            itemCfg.props.advanced.label.backgroundStroke = themeVars.backgroundColor;
          }
        }
      });
      draft.components.forEach(itemCfg => {
        if (itemCfg.id === 'CanvasSetting') {
          itemCfg.props.styleCanvas.backgroundColor = themeVars.backgroundColor;
          itemCfg.props.styleCanvas.background = themeVars.backgroundColor;
        }
      });
    });
  } catch (error) {
    console.log('error', error);
    return config;
  }
};

const getCanvasStyle = config => {
  return config.components.find(item => item.id === 'CanvasSetting').props;
};

const useTheme = (context, updateState) => {
  const { config, themes } = context;

  React.useEffect(() => {
    (async () => {
      const { config, themes, id: projectId } = context;
      const themeValue = localStorage.getItem('@theme') || 'light';

      if (!themes) {
        //如果初始化阶段 Themes，则默认提供黑白两套主题的配置
        const lightConfig = getConfigByTheme(config, 'light');
        const aliConfig = getConfigByTheme(config, 'ali');
        const darkConfig = getConfigByTheme(config, 'dark');
        const greenConfig = getConfigByTheme(config, 'green');

        //需要和「ThemeSetting」资产做联动
        const lightTheme = {
          canvasConfig: getCanvasStyle(lightConfig),
          nodesConfig: lightConfig.nodes,
          edgesConfig: lightConfig.edges,
          name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.FreshBlue', dm: '清新蓝' }),
          id: 'light',
          primaryColor: 'rgb(18, 128, 117)',
        };
        const aliTheme = {
          canvasConfig: getCanvasStyle(aliConfig),
          nodesConfig: lightConfig.nodes,
          edgesConfig: lightConfig.edges,
          name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.WarmSunOrange', dm: '暖阳橙' }),
          id: 'ali',
          primaryColor: 'rgb(255, 106, 0)',
        };
        const darkTheme = {
          canvasConfig: getCanvasStyle(darkConfig),
          nodesConfig: darkConfig.nodes,
          edgesConfig: darkConfig.edges,
          name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.DarkNightBlack', dm: '暗夜黑' }),
          id: 'dark',
          primaryColor: 'rgb(31, 31, 31)',
        };
        const greenTheme = {
          canvasConfig: getCanvasStyle(greenConfig),
          nodesConfig: greenConfig.nodes,
          edgesConfig: greenConfig.edges,
          name: $i18n.get({ id: 'gi-site.components.ThemeVars.useTheme.MangoGreen', dm: '芒种绿' }),
          id: 'green',
          primaryColor: 'rgb(39,118,88)',
        };

        const defaultThemes = [lightTheme, aliTheme, darkTheme, greenTheme];

        //@ts-ignore
        const { GI_PROJECT_DB } = window;
        const project = await GI_PROJECT_DB.getItem(projectId);

        if (!project) {
          return;
        }
        GI_PROJECT_DB.setItem(projectId, { ...project, themes: defaultThemes });
        updateState(draft => {
          draft.themes = defaultThemes;
          draft.theme = themeValue;
          if (themeValue === 'light') draft.config = lightConfig;
          if (themeValue === 'ali') draft.config = aliConfig;
          if (themeValue === 'green') draft.config = greenConfig;
          if (themeValue === 'dark') draft.config = darkConfig;
        });
      }
    })();
  }, []);
  const changeTheme = themeValue => {
    const theme = themes.find(item => item.id === themeValue);

    const newConfig = produce(config, draft => {
      draft.components.forEach(itemCfg => {
        if (itemCfg.id === 'CanvasSetting') {
          itemCfg.props = theme.canvasConfig;
        }
      });
      draft.nodes = theme.nodesConfig;
      draft.edges = theme.edgesConfig;
    });

    updateState(draft => {
      draft.config = newConfig;
      draft.theme = themeValue;
    });
  };
  return {
    changeTheme,
  };
};

export default useTheme;
