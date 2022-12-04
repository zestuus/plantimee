import React, { useState } from 'react';
import styled from 'styled-components';

import DateFnsUtils from '@date-io/date-fns';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { DialogActions, MenuItem, Select } from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import withSettings from '../HOCs/withSettings';
import SelectBlock from '../common/SelectBlock';
import { LOCALE } from '../../constants/enums';
import { OneDay } from '../../constants/config';
import { getDateObjectFromTimeString, getDayBounds, getPluralizePeriodsSuffix } from '../../utils/helpers';
import { TooltipText } from '../EventDashboard/Events';

const Content = styled(Grid)`
  margin-bottom: 10px;
`;

const Row = styled(Grid)`
  height: 80px;
  margin: 5px 0;
`;

const RowName = styled.span`
  font-size: 16px;
  font-weight: bold;
  margin-right: 20px;
`;

const TimeSeparator = styled.span`
  margin-top: 5px;
  font-weight: bold;
`;

const HelpIcon = styled(HelpOutlineOutlinedIcon)`
  position: relative;
  top: 5px;
`

const SEARCH_LIMITS = {
  START: 'START',
  END: 'END',
};

const SEARCH_TYPE = {
  DEFAULT: 'DEFAULT',
  PERIOD: 'PERIOD',
  DATETIME: 'DATETIME',
};

const SEARCH_PERIOD = {
  MINUTE: 'MINUTE',
  HOUR: 'HOUR',
  DAY: 'DAY',
  WEEK: 'WEEK',
};

const SEARCH_PERIOD_LABELS = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
};

const SEARCH_PERIODS = Object.values(SEARCH_PERIOD);

const SEARCH_PERIOD_DURATION = {
  [SEARCH_PERIOD.MINUTE]: 1,
  [SEARCH_PERIOD.HOUR]: 60,
  [SEARCH_PERIOD.DAY]: 24 * 60,
  [SEARCH_PERIOD.WEEK]: 7 * 24 * 60,
};

const SEARCH_DURING_TYPE = {
  DEFAULT: 'DEFAULT',
  CUSTOM: 'CUSTOM'
};

const SEARCH_DURING_CUSTOM_TYPE = {
  WORK_HOURS: 'WORK_HOURS',
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING',
  NIGHT: 'NIGHT',
};

const SEARCH_DURING_CUSTOM_TYPES = Object.values(SEARCH_DURING_CUSTOM_TYPE);

const SEARCH_DURING_CUSTOM_TYPE_LABEL = {
  [SEARCH_DURING_CUSTOM_TYPE.WORK_HOURS]: 'Working hours',
  [SEARCH_DURING_CUSTOM_TYPE.MORNING]: 'Morning',
  [SEARCH_DURING_CUSTOM_TYPE.AFTERNOON]: 'Afternoon',
  [SEARCH_DURING_CUSTOM_TYPE.EVENING]: 'Evening',
  [SEARCH_DURING_CUSTOM_TYPE.NIGHT]: 'Night',
};

const SEARCH_DURING_CUSTOM_TYPE_RANGES = {
  [SEARCH_DURING_CUSTOM_TYPE.WORK_HOURS]: { startTime: '09:00', endTime: '17:00'},
  [SEARCH_DURING_CUSTOM_TYPE.MORNING]: { startTime: '06:00', endTime: '12:00'},
  [SEARCH_DURING_CUSTOM_TYPE.AFTERNOON]: { startTime: '12:00', endTime: '18:00'},
  [SEARCH_DURING_CUSTOM_TYPE.EVENING]: { startTime: '18:00', endTime: '23:59'},
  [SEARCH_DURING_CUSTOM_TYPE.NIGHT]: { startTime: '00:00', endTime: '06:00'},
};

const AutoFindModal = ({ open, autoFindProps, onClose, setAutoFindProps, translate: __, language }) => {
  const now = new Date();
  now.setSeconds(0, 0);
  const { dayEnd } = getDayBounds(now);
  now.setMinutes(now.getMinutes() + 1);
  const { startTime, endTime } = SEARCH_DURING_CUSTOM_TYPE_RANGES[SEARCH_DURING_CUSTOM_TYPE.WORK_HOURS];
  const searchDuringStartTimeDefault = getDateObjectFromTimeString(startTime);
  const searchDuringEndTimeDefault = getDateObjectFromTimeString(endTime);

  const [searchStartType, setSearchStartType] = useState(SEARCH_TYPE.DEFAULT);
  const [searchStartInterval, setSearchStartInterval] = useState(5);
  const [searchStartPeriod, setSearchStartPeriod] = useState(SEARCH_PERIOD.MINUTE);
  const [searchStartTime, setSearchStartTime] = useState(now);

  const [searchEndType, setSearchEndType] = useState(SEARCH_TYPE.DEFAULT);
  const [searchEndInterval, setSearchEndInterval] = useState(1);
  const [searchEndPeriod, setSearchEndPeriod] = useState(SEARCH_PERIOD.DAY);
  const [searchEndTime, setSearchEndTime] = useState(dayEnd);

  const [searchDuringType, setSearchDuringType] = useState(SEARCH_DURING_TYPE.DEFAULT);
  const [searchDuringCustomType, setSearchDuringCustomType] = useState(SEARCH_DURING_CUSTOM_TYPE.WORK_HOURS);
  const [searchDuringStartTime, setSearchDuringStartTime] = useState(searchDuringStartTimeDefault);
  const [searchDuringEndTime, setSearchDuringEndTime] = useState(searchDuringEndTimeDefault);

  const limitDuration = searchEndTime - searchStartTime;
  const limitDurationInDays = limitDuration / OneDay;

  const SEARCH_BLOCKS = (startOrEnd) => [
    {
      type: SEARCH_TYPE.DEFAULT,
      title: startOrEnd === SEARCH_LIMITS.START ? 'Now' : 'Until end of the day',
      width: 100,
      handleClick: () => {
        if (startOrEnd === SEARCH_LIMITS.START) {
          setSearchStartTime(now);
          if (searchEndType === SEARCH_TYPE.PERIOD) {
            const newSearchEndTime = new Date(now);
            newSearchEndTime.setMinutes(
              newSearchEndTime.getMinutes() + SEARCH_PERIOD_DURATION[searchEndPeriod] * searchEndInterval,
              0
            );
            setSearchEndTime(newSearchEndTime);
          }
        } else {
          const { dayEnd } = getDayBounds(searchStartTime);
          setSearchEndTime(dayEnd);
        }
      },
      content: null
    },
    {
      type: SEARCH_TYPE.PERIOD,
      title: startOrEnd === SEARCH_LIMITS.START ? '' : 'During',
      width: startOrEnd === SEARCH_LIMITS.START ? 255: 220,
      handleClick: () => {
        if (startOrEnd === SEARCH_LIMITS.START) {
          const newSearchStartTime = new Date();
          newSearchStartTime.setMinutes(
            newSearchStartTime.getMinutes() + SEARCH_PERIOD_DURATION[searchStartPeriod] * searchStartInterval,
            0
          );
          setSearchStartTime(newSearchStartTime);
          if (searchEndType === SEARCH_TYPE.PERIOD) {
            const newSearchEndTime = new Date(newSearchStartTime);
            newSearchEndTime.setMinutes(
              newSearchEndTime.getMinutes() + SEARCH_PERIOD_DURATION[searchEndPeriod] * searchEndInterval,
              0
            );
            setSearchEndTime(newSearchEndTime);
          }
        } else {
          const newSearchEndTime = new Date(searchStartTime);
          newSearchEndTime.setMinutes(
            newSearchEndTime.getMinutes() + SEARCH_PERIOD_DURATION[searchEndPeriod] * searchEndInterval,
            0
          );
          setSearchEndTime(newSearchEndTime);
        }
      },
      content: (
        <>
          <Grid container alignItems="center" justifyContent="center">
            <TextField
              type="number"
              value={startOrEnd === SEARCH_LIMITS.START ? searchStartInterval : searchEndInterval}
              style={{ width: 40, marginRight: 5 }}
              inputProps={{ style: { textAlign: 'center' } }}
              onChange={event => {
                const setValue = startOrEnd === SEARCH_LIMITS.START ? setSearchStartInterval : setSearchEndInterval;

                setValue(Math.max(Math.min(parseInt(event.target.value, 10), 1000), 1))
              }}
            />
            <Select
              value={startOrEnd === SEARCH_LIMITS.START ? searchStartPeriod : searchEndPeriod}
              onChange={event => {
                const setValue = startOrEnd === SEARCH_LIMITS.START ? setSearchStartPeriod : setSearchEndPeriod;

                setValue(event.target.value);
              }}
            >
              {SEARCH_PERIODS.map(period => (
                <MenuItem key={period} value={period}>
                  {__(` ${SEARCH_PERIOD_LABELS[period]}${getPluralizePeriodsSuffix(startOrEnd === SEARCH_LIMITS.START ? searchStartInterval : searchEndInterval)}`)}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {startOrEnd === SEARCH_LIMITS.START ? __('after current time') : null}
        </>

      )
    },
    {
      type: SEARCH_TYPE.DATETIME,
      title: startOrEnd === SEARCH_LIMITS.START ? 'Date and time ' : 'Until date and time',
      width: 200,
      content: (
        <Grid container alignItems="center" justifyContent="center">
          <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
            <DatePicker
              variant="inline"
              format="yyyy/MM/dd"
              style={{ width: 88, marginRight: 10 }}
              value={startOrEnd === SEARCH_LIMITS.START ? searchStartTime : searchEndTime}
              onChange={value => {
                if (startOrEnd === SEARCH_LIMITS.START) {
                  setSearchStartTime(value);
                  switch (searchEndType) {
                    case SEARCH_TYPE.DEFAULT:
                      const { dayEnd } = getDayBounds(value);
                      setSearchEndTime(dayEnd);
                      break;
                    case SEARCH_TYPE.PERIOD:
                      const newSearchEndTime = new Date(value);
                      newSearchEndTime.setMinutes(
                        newSearchEndTime.getMinutes() + SEARCH_PERIOD_DURATION[searchEndPeriod] * searchEndInterval,
                        0
                      );
                      setSearchEndTime(newSearchEndTime);
                      break;
                    case SEARCH_TYPE.DATETIME:
                      if (value > searchEndTime) {
                        const { dayEnd } = getDayBounds(value);
                        setSearchEndTime(dayEnd);
                      }
                      break;
                    default:
                      break;
                  }
                } else {
                  setSearchEndTime(value);
                }
              }}
            />
            <TimePicker
              variant="inline"
              format="HH:mm"
              style={{ width: 40 }}
              value={startOrEnd === SEARCH_LIMITS.START ? searchStartTime : searchEndTime}
              onChange={value => {
                if (startOrEnd === SEARCH_LIMITS.START) {
                  setSearchStartTime(value);
                } else {
                  setSearchEndTime(value);
                }
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
      )
    },
  ];

  const SEARCH_DURING_BLOCKS = [
    {
      type: SEARCH_DURING_TYPE.DEFAULT,
      title: limitDurationInDays <= 1 ? 'Whole day' : 'Whole days',
      width: 100,
      content: null,
    },
    {
      type: SEARCH_DURING_TYPE.CUSTOM,
      title: '',
      width: 170,
      content: (
        <Grid container direction="column" alignItems="center" justifyContent="center">
          <Select
            value={searchDuringCustomType}
            onChange={event => {
              setSearchDuringCustomType(event.target.value);
              const { startTime, endTime } = SEARCH_DURING_CUSTOM_TYPE_RANGES[event.target.value];
              const newSearchDuringStartTime = getDateObjectFromTimeString(startTime);
              const newSearchDuringEndTime = getDateObjectFromTimeString(endTime);
              setSearchDuringStartTime(newSearchDuringStartTime);
              setSearchDuringEndTime(newSearchDuringEndTime);
            }}
          >
            {SEARCH_DURING_CUSTOM_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {__(`${SEARCH_DURING_CUSTOM_TYPE_LABEL[type]}${(limitDurationInDays < 1.5 || type === SEARCH_DURING_CUSTOM_TYPE.WORK_HOURS) ? '' : 's'}`)}
              </MenuItem>
            ))}
          </Select>
          <MuiPickersUtilsProvider key="date-pickers" utils={DateFnsUtils} locale={LOCALE[language]}>
            <Grid container justifyContent="center">
              <TimePicker
                variant="inline"
                format="HH:mm"
                style={{ width: 40, margin: '0 3px' }}
                value={searchDuringStartTime}
                onChange={value => {
                  setSearchDuringStartTime(value);
                }}
              />
              <TimeSeparator>-</TimeSeparator>
              <TimePicker
                variant="inline"
                format="HH:mm"
                style={{ width: 40, margin: '0 3px' }}
                value={searchDuringEndTime}
                onChange={value => {
                  setSearchDuringEndTime(value);
                }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
        </Grid>
      ),
    },
  ]

  return (
    <Dialog maxWidth="md" open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{__('Auto find time settings')}</DialogTitle>
      <DialogContent>
        <Content container direction="column">
          <Row container direction="row" alignItems="center">
            <RowName>{__('From:')}</RowName>
            {SEARCH_BLOCKS(SEARCH_LIMITS.START).map(({type, title, width, content, handleClick}) => (
              <SelectBlock
                key={type}
                title={__(title)}
                width={width}
                selected={searchStartType === type}
                onClick={() => {
                  setSearchStartType(type);
                  if (handleClick) {
                    handleClick();
                  }
                }}
              >
                {content}
              </SelectBlock>
            ))}
          </Row>
          <Row container direction="row" alignItems="center">
            <RowName>{__('Search:')}</RowName>
            {SEARCH_BLOCKS(SEARCH_LIMITS.END).map(({type, title, width, content, handleClick}) => (
              <SelectBlock
                key={type}
                title={__(title)}
                width={width}
                selected={searchEndType === type}
                onClick={() => {
                  setSearchEndType(type);
                  if (handleClick) {
                    handleClick();
                  }
                }}
              >
                {content}
              </SelectBlock>
            ))}
          </Row>
          <Row container direction="row" alignItems="center">
            <RowName>
              {__('During')}&nbsp;
              <Tooltip
                title={(
                  <TooltipText>
                    {__('Limits time range per each day. For example, to prevent scheduling work meeting outside of working hours')}
                  </TooltipText>
                )}
              >
                <HelpIcon />
              </Tooltip>
              :
            </RowName>
            {SEARCH_DURING_BLOCKS.map(({type, title, width, content, handleClick}) => (
              <SelectBlock
                key={type}
                title={__(title)}
                width={width}
                selected={searchDuringType === type}
                onClick={() => {
                  setSearchDuringType(type);
                  if (handleClick) {
                    handleClick();
                  }
                }}
              >
                {content}
              </SelectBlock>
            ))}
          </Row>
          <DialogActions>
            <Button
              onClick={onClose}
            >
              {__('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const fromDate = searchStartTime;
                const toDate = searchEndTime;
                let fromTime = null;
                let toTime = null;
                if (searchDuringType !== SEARCH_DURING_TYPE.DEFAULT) {
                  if (searchDuringStartTime) {
                    const hour = searchDuringStartTime.getHours();
                    const minute = searchDuringStartTime.getMinutes();
                    fromTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  }
                  if (searchDuringEndTime) {
                    const hour = searchDuringEndTime.getHours();
                    const minute = searchDuringEndTime.getMinutes();
                    toTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  }
                }
                setAutoFindProps({
                  ...autoFindProps,
                  fromDate,
                  toDate,
                  fromTime,
                  toTime
                });
                onClose();
              }}
            >
              {__('Save')}
            </Button>
          </DialogActions>
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default withSettings(AutoFindModal);