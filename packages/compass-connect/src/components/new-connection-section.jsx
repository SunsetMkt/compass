const React = require('react');
const PropTypes = require('prop-types');
const Actions = require('../actions');

class NewConnectionSection extends React.Component {

  onNewConnectionClicked() {
    Actions.resetConnection();
  }

  getClassName() {
    const connection = this.props.currentConnection;
    let className = 'connect-sidebar-new-connection';
    if (!connection || (!connection.is_favorite && !connection.last_used)) {
      className += ' connect-sidebar-new-connection-is-active';
    }
    return className;
  }

  render() {
    return (
      <div className={this.getClassName()}>
        <div className="connect-sidebar-header" onClick={this.onNewConnectionClicked.bind(this)}>
          <i className="fa fa-fw fa-bolt" />
          <span>New Connection</span>
        </div>
      </div>
    );
  }
}

NewConnectionSection.displayName = 'NewConnectionSection';

NewConnectionSection.propTypes = {
  currentConnection: PropTypes.object.isRequired
};

module.exports = NewConnectionSection;
