import React from 'react';
import { connect } from 'react-redux';

import i18n from '../../constants/i18n';


const withTranslate = Component => (props) => {
  const { language } = props;
  const translate = i18n[language] || ((value) => value);
  return <Component {...props} translate={translate}/>
}

const mapStateToProps = (state) => state.settings;

const withSettings = WrappedComponent => connect(mapStateToProps)(withTranslate(WrappedComponent));

export default withSettings;