import React, { Component } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { changeLayout, insertTrack, deleteTrack, replaceSong } from '../../actions/tracks';
import { setPlayingIndex, toggleMetronome, toggleCountdown } from '../../actions/playingIndex';
import { setCursor } from '../../actions/cursor';
import { addRepeatEnd } from '../../actions/measure';
import { timeSignatureSelector } from '../../util/selectors';
import { importMusicXml } from '../../util/musicXml';

import InstrumentSelect from './InstrumentSelect';
import TrackSelect from './TrackSelect';

const style = {
  position: 'fixed',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  top: 0,
  left: 0,
  height: '100%',
  zIndex: 99,
  width: 255,
  overflow: 'hidden',
  background: 'tomato',
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
};

const hiddenStyle = { display: 'none' };

class EditorButton extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.type);
  }

  render() {
    return <button onClick={this.onClick}>{this.props.label}</button>;
  }
}

class EditorArea extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;

  constructor() {
    super();

    this.toggleLayout = this.toggleLayout.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.renderPlayButton = this.renderPlayButton.bind(this);
    this.renderPlayStop = this.renderPlayStop.bind(this);
    this.addRepeatEnd = this.addRepeatEnd.bind(this);
    this.inputRef = this.inputRef.bind(this);
    this.importClicked = this.importClicked.bind(this);
    this.onImport = this.onImport.bind(this);
    this.onFileRead = this.onFileRead.bind(this);
  }

  toggleLayout() {
    this.props.changeLayout(this.props.layout === 'page' ? 'linear' : 'page');
  }

  handleStop() {
    this.props.setCursor({
      measureIndex: this.props.playingIndex.measureIndex,
      noteIndex: this.props.playingIndex.noteIndex,
      stringIndex: this.props.cursor.stringIndex
    });
    this.props.setPlayingIndex(null);
  }

  renderPlayButton(canPlay) {
    return canPlay ? <button onClick={this.props.handlePlay}>Play</button> : <button disabled>Play</button>;
  }

  renderPlayStop(canPlay) {
    return this.props.playingIndex ?
      <button onClick={this.handleStop}>Stop</button> :
      this.renderPlayButton(canPlay);
  }

  addRepeatEnd() {
    this.props.addRepeatEnd(this.props.cursor);
  }

  inputRef(input) {
    this._input = input;
  }

  importClicked() {
    this._input.click();
  }

  onImport(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = this.onFileRead;
    reader.readAsText(file);
  }

  onFileRead(e) {
    const tracks = importMusicXml(e.target.result);
    this.props.replaceSong(tracks);
  }

  render() {
    const { openModal, timeSignature, layout, canPlay, tracks } = this.props;
    const blob = new Blob([JSON.stringify(tracks)], { type: 'application/json' });
    const url  = window.URL.createObjectURL(blob);

    const timeSignatureLabel = `${timeSignature.beats}/${timeSignature.beatType}`;

    return (
      <div style={style}>
        { this.renderPlayStop(canPlay) }
        <EditorButton onClick={openModal} type='timeSig' label={timeSignatureLabel} />
        <button onClick={this.toggleLayout}>{layout}</button>
        <EditorButton onClick={openModal} type='tuning' label='tuning' />
        <EditorButton onClick={openModal} type='bpm' label='bpm' />
        <InstrumentSelect />
        <button onClick={this.props.insertTrack}>add track</button>
        <button onClick={this.props.deleteTrack}>remove track</button>
        <TrackSelect />
        <button onClick={this.addRepeatEnd}>repeat</button>
        <button onClick={this.props.toggleMetronome}>{ this.props.metronome ? 'metronome on' : 'metronome off'}</button>
        <button onClick={this.props.toggleCountdown}>{ this.props.countdown ? 'countdown on' : 'countdown off'}</button>
        <button><a download='song' href={url}>export</a></button>
        <input ref={this.inputRef} type='file' style={hiddenStyle} onChange={this.onImport} />
        <button onClick={this.importClicked}>import MusicXML</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tracks: state.present.tracks,
    layout: state.present.layout,
    playingIndex: state.present.playingIndex,
    cursor: state.present.cursor,
    timeSignature: timeSignatureSelector(state),
    metronome: state.present.metronome,
    countdown: state.present.countdown
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeLayout: bindActionCreators(changeLayout, dispatch),
    insertTrack: bindActionCreators(insertTrack, dispatch),
    deleteTrack: bindActionCreators(deleteTrack, dispatch),
    setPlayingIndex: bindActionCreators(setPlayingIndex, dispatch),
    setCursor: bindActionCreators(setCursor, dispatch),
    addRepeatEnd: bindActionCreators(addRepeatEnd, dispatch),
    toggleMetronome: bindActionCreators(toggleMetronome, dispatch),
    toggleCountdown: bindActionCreators(toggleCountdown, dispatch),
    replaceSong: bindActionCreators(replaceSong, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorArea);
