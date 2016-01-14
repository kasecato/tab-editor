import React, { Component } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { changeLayout, insertTrack, deleteTrack } from '../../actions/tracks';
import { timeSignatureSelector } from '../../util/selectors';
import InstrumentSelect from './InstrumentSelect';
import TrackSelect from './TrackSelect';

class EditorArea extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;

  renderPlayStop() {
    return this.props.isPlaying ?
      <button onClick={this.props.handleStop}>Stop</button> :
      <button onClick={this.props.handlePlay}>Play</button>;
  };

  toggleLayout = () => {
    this.props.changeLayout(this.props.layout === 'page' ? 'linear' : 'page');
  };

  render() {
    const { openModal, timeSignature, layout } = this.props;

    const style = {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      top: 0,
      left: 0,
      height: 50,
      zIndex: 99,
      width: '100%',
      background: 'tomato'
    };

    return (
      <div style={style}>
        { this.renderPlayStop() }
        <button onClick={openModal.bind(this, 'timeSig')}>{timeSignature}</button>
        <button onClick={this.toggleLayout}>{layout}</button>
        <button onClick={openModal.bind(this, 'tuning')}>tuning</button>
        <button onClick={openModal.bind(this, 'bpm')}>bpm</button>
        <InstrumentSelect />
        <button onClick={this.props.insertTrack}>add track</button>
        <button onClick={this.props.deleteTrack}>remove track</button>
        <TrackSelect />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    layout: state.layout,
    isPlaying: state.playingNote ? true : false,
    timeSignature: timeSignatureSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeLayout: bindActionCreators(changeLayout, dispatch),
    insertTrack: bindActionCreators(insertTrack, dispatch),
    deleteTrack: bindActionCreators(deleteTrack, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorArea);