import React from 'react';
import Remarkable from 'remarkable';
import {Link} from 'react-router';


import '../css/base.css';



module.exports = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable({html: true});
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="task">
        <Link to={'/' + this.props.id}>{this.props.Title}</Link>
      </div>
    );
  }
});
