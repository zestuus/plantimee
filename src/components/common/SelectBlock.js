import React from 'react';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { PRIMARY_COLOR } from '../../constants/config';

const Block = styled(Grid)`
  margin: 0 6px;
  padding: 3px;
  width: ${props => props.width || 100}px;
  height: 100%;
  border: ${props => props.selected ? 3 : 1}px solid ${PRIMARY_COLOR};
  border-radius: 5px;
  ${props => props.selected ? 'background-color: #fafcfd' : ''};

  :hover {
    background-color: aliceblue;
    cursor: pointer;
  }
`;

const Title = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: bold;
  text-align: center;
`;

const SelectBlock = ({ title, onClick, children, width, selected = false }) => {
  return (
    <Block
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      selected={selected}
      width={width}
      onClick={onClick}
    >
      {!!title && <Title>{title}</Title>}
      {children}
    </Block>
  );
};

export default SelectBlock;