import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { compose } from 'redux';
import { inject } from 'lib/Injector';
import classNames from 'classnames';
import { elementTypeType } from 'types/elementTypeType';
import { elementType } from 'types/elementType';
import { isOverTop } from 'lib/dragHelpers';

const noop = () => {};

/**
 * Grid wrapper around elemental's own Element component.
 *
 * Elemental >= 5.4 provides an ElementContext from its Element component which is
 * consumed by the element actions (Save / Publish). Replacing elemental's Element
 * breaks those actions ("useContext(...) is null"), so instead we keep elemental's
 * Element and only add the grid column holder, the column size controls and the
 * horizontal drag & drop handling.
 */
class GridElement extends Component {
  constructor(props) {
    super(props);

    this.handleChangeSize = this.handleChangeSize.bind(this);
    this.handleChangeOffset = this.handleChangeOffset.bind(this);

    this.state = {
      size: props.element.blockSchema.grid.column.size,
      offset: props.element.blockSchema.grid.column.offset,
    };
  }

  getColumnSizeClassNames() {
    const { element, isDraggedOver, isDraggedOverPosition } = this.props;
    const { size, offset } = this.state;

    return {
      [`col-lg-${size}`]: true,
      [`offset-lg-${offset}`]: true,
      'is-row': element.blockSchema.grid.isRow === true,
      'is-dragged-top': isDraggedOver && isDraggedOverPosition === 'top',
      'is-dragged-bottom': isDraggedOver && isDraggedOverPosition === 'bottom',
    };
  }

  handleChangeSize(e) {
    this.setState({
      size: e.target.value,
    });
  }

  handleChangeOffset(e) {
    this.setState({
      offset: e.target.value,
    });
  }

  render() {
    const {
      element,
      type,
      areaId,
      link,
      onDragEnd,
      onDragStart,
      connectDropTarget,
      ElementComponent,
      ColumnSizeComponent,
    } = this.props;

    if (!element.id) {
      return null;
    }

    return connectDropTarget(
      <div
        key={element.id}
        className={classNames('element-editor__element-holder', this.getColumnSizeClassNames())}
      >
        <ElementComponent
          element={element}
          type={type}
          areaId={areaId}
          link={link}
          // onDragOver is intentionally not passed: drag over is handled by this
          // holder using the horizontal grid logic
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          // Grid blocks are not inline editable, so there are no element forms to
          // save as part of the page form submission
          saveElement={false}
          onChangeHasUnsavedChanges={noop}
          onBeforeSubmitForm={noop}
          onAfterSubmitResponse={noop}
          increment={0}
        />

        {!element.blockSchema.grid.isRow &&
          <div className="element-editor__column-size">
            <ColumnSizeComponent
              elementId={element.id}
              size={element.blockSchema.grid.column.size}
              defaultViewport={element.blockSchema.grid.column.defaultViewport}
              gridColumns={element.blockSchema.grid.gridColumns}
              offset={element.blockSchema.grid.column.offset}
              handleChangeSize={this.handleChangeSize}
              handleChangeOffset={this.handleChangeOffset}
            />
          </div>
        }
      </div>
    );
  }
}

GridElement.propTypes = {
  element: elementType,
  type: elementTypeType.isRequired,
  areaId: PropTypes.number.isRequired,
  link: PropTypes.string.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  onDragOver: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  onDragEnd: PropTypes.func,
  onDragStart: PropTypes.func,
  isDraggedOver: PropTypes.bool,
  isDraggedOverPosition: PropTypes.string,
};

GridElement.defaultProps = {
  element: null,
};

export { GridElement as Component };

const elementTarget = {
  // This outer target's drop result overrides the vertical one from elemental's Element
  drop(props, monitor, component) {
    const { element } = props;
    return {
      target: element.id,
      dropSpot: isOverTop(monitor, component) ? 'top' : 'bottom',
    };
  },

  hover(props, monitor, component) {
    const { element, onDragOver } = props;

    if (onDragOver) {
      onDragOver(element, isOverTop(monitor, component));
    }
  },
};

export default compose(
  DropTarget('element', elementTarget, (connector) => ({
    connectDropTarget: connector.dropTarget(),
  })),
  inject(
    ['Element', 'ColumnSize'],
    (ElementComponent, ColumnSizeComponent) => ({
      ElementComponent,
      ColumnSizeComponent,
    }),
    () => 'ElementEditor.ElementList.GridElement'
  )
)(GridElement);
