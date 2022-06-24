import iconLoader from '@antv/graphin-icons';
import React from 'react';
import { handlePinNode } from '../common/handlePinNode';

// @ts-ignore
const icons = Graphin.registerFontFamily(iconLoader);

import type { IGIAC } from '@alipay/graphinsight';
import { extra, useContext } from '@alipay/graphinsight';

const { GIAComponent, deepClone } = extra;

export interface IProps {
  GIAC: IGIAC;
  autoPin: boolean;
  dragNodeMass: number;
}

const ForceSimulation: React.FunctionComponent<IProps> = props => {
  const GIAC = deepClone(props.GIAC);
  const { graph, layoutInstance } = useContext();
  const [state, setState] = React.useState({
    toggle: false,
    selected: [],
  });
  const { toggle, selected } = state;

  const handleClick = () => {
    const { instance = {} } = layoutInstance || {};
    const { simulation, type } = instance;
    const isForce = type === 'graphin-force' && simulation;

    if (isForce) {
      setState({
        ...state,
        toggle: !toggle,
      });
      if (!toggle) {
        simulation.stop();
      } else {
        simulation.restart([], graph);
      }
    }
  };

  const { autoPin, dragNodeMass = 10000000000 } = props;

  React.useEffect(() => {
    const { instance = {} } = layoutInstance || {};
    const { simulation, type } = instance;

    const handleNodeDragStart = () => {
      if (simulation) {
        simulation.stop();
      }
    };
    const handleNodeDragEnd = (e: any) => {
      if (type !== 'graphin-force') {
        return;
      }
      if (!autoPin) {
        return;
      }

      if (e.item) {
        handlePinNode(e.item, graph, layoutInstance, {
          dragNodeMass,
          x: e.x,
          y: e.y,
        });
      }
    };

    graph.on('node:dragstart', handleNodeDragStart);
    graph.on('node:dragend', handleNodeDragEnd);
    return () => {
      graph.off('node:dragstart', handleNodeDragStart);
      graph.off('node:dragend', handleNodeDragEnd);
    };
  }, [graph, autoPin]);

  GIAC.icon = toggle ? 'icon-play-circle' : 'icon-pause';
  GIAC.tooltip = toggle ? '重启力导布局' : '暂停力导布局';

  return <GIAComponent GIAC={GIAC} onClick={handleClick} />;
};

export default ForceSimulation;