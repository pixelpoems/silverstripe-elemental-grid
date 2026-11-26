import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Config from 'lib/Config';

class ColumnSize extends PureComponent {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleChangeSize = this.handleChangeSize.bind(this);
    this.handleChangeOffset = this.handleChangeOffset.bind(this);
  }

  getColSizeSource() {
    const colSizes = [];

    for (let size = 1; size <= this.props.gridColumns; size++) {
      colSizes.push({
        label: `Column ${size}/${this.props.gridColumns}`,
        value: size
      });
    }

    return colSizes;
  }

  getOffsetSizeSource() {
    const offsetSizes = [];

    offsetSizes.push({
      label: 'None',
      value: 0
    });

    for (let size = 1; size <= this.props.gridColumns; size++) {
      offsetSizes.push({
        label: `Column ${size}/${this.props.gridColumns}`,
        value: size
      });
    }

    return offsetSizes;
  }

  handleClick(event) {
    event.stopPropagation();
  }

  handleChangeSize(event) {
    this.saveColumnValue('Size', event.target.value);
    this.props.handleChangeSize(event);
  }

  handleChangeOffset(event) {
    this.saveColumnValue('Offset', event.target.value);
    this.props.handleChangeOffset(event);
  }

  /**
   * Persist the column size / offset directly on the element.
   *
   * Grid blocks are not inline editable, so there is no element form that would
   * submit these values together with the page form.
   */
  saveColumnValue(type, value) {
    const { elementId, defaultViewport } = this.props;
    const section = Config.getSection('DNADesign\\Elemental\\Controllers\\ElementalAreaController');
    const baseUrl = Config.get('absoluteBaseUrl').replace(/\/+$/, '');
    const controllerUrl = section.url.replace(/^\/+|\/+$/g, '');
    const url = `${baseUrl}/${controllerUrl}/gridColumn/${elementId}`;
    const body = new URLSearchParams({
      Type: type,
      Viewport: defaultViewport,
      Value: value,
      SecurityID: Config.get('SecurityID'),
    });

    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json()
            .catch(() => ({}))
            .then((data) => {
              throw new Error(data.message || `HTTP ${response.status}`);
            });
        }
        return response.json();
      })
      .then(() => this.refetchBlocks())
      .catch((error) => {
        const message = `Could not save ${type} ${defaultViewport}: ${error.message}`;
        if (window.jQuery && window.jQuery.noticeAdd) {
          window.jQuery.noticeAdd({ text: message, type: 'error', stayTime: 5000 });
        } else {
          // eslint-disable-next-line no-console
          console.error(message);
        }
      });
  }

  /**
   * Refetch the blocks of the elemental area, so the versioned badge
   * ("modified") of the element is updated.
   */
  refetchBlocks() {
    const client = window.ss && window.ss.apolloClient;
    if (client && typeof client.refetchQueries === 'function') {
      client.refetchQueries({ include: ['ReadBlocksForArea'] });
    }
  }

  render() {
    return (
      <div>
        <hr />

        <label className="mb-0 font-italic" htmlFor="colSize">
          Size { this.props.defaultViewport }
          <select
            defaultValue={this.props.size}
            onChange={this.handleChangeSize}
            onClick={this.handleClick}
            id="colSize"
          >
            {
              this.getColSizeSource().map((columnObject) => (
                <option value={columnObject.value}>{columnObject.label}</option>
              ))
            }
          </select>
        </label>
        <label className="mb-0 ml-2 font-italic" htmlFor="colOffset">
          Offset { this.props.defaultViewport }
          <select
            defaultValue={this.props.offset}
            onChange={this.handleChangeOffset}
            onClick={this.handleClick}
            id="colOffset"
          >
            {
              this.getOffsetSizeSource().map((columnObject) => (
                <option value={columnObject.value}>{columnObject.label}</option>
              ))
            }
          </select>
        </label>
      </div>
    );
  }
}

ColumnSize.defaultProps = {};

ColumnSize.propTypes = {
  elementId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number,
  defaultViewport: PropTypes.string,
  offset: PropTypes.number,
  gridColumns: PropTypes.number,
  handleChangeSize: PropTypes.func,
  handleChangeOffset: PropTypes.func,
};

export default ColumnSize;
