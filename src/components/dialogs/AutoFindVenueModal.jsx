import React, { useState } from 'react';
import styled from 'styled-components';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { DialogActions, InputAdornment } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import withSettings from '../HOCs/withSettings';
import { Autocomplete } from '@material-ui/lab';

const Content = styled(Grid)`
  margin-bottom: 10px;
`;

const LOCATION_TYPE = {
  ANY: 'any',
  ACCOUNTING: 'accounting',
  AIRPORT: 'airport',
  AMUSEMENT_PARK: 'amusement_park',
  AQUARIUM: 'aquarium',
  ART_GALLERY: 'art_gallery',
  ATM: 'atm',
  BAKERY: 'bakery',
  BANK: 'bank',
  BAR: 'bar',
  BEAUTY_SALON: 'beauty_salon',
  BICYCLE_STORE: 'bicycle_store',
  BOOK_STORE: 'book_store',
  BOWLING_ALLEY: 'bowling_alley',
  BUS_STATION: 'bus_station',
  CAFE: 'cafe',
  CAMPGROUND: 'campground',
  CAR_DEALER: 'car_dealer',
  CAR_RENTAL: 'car_rental',
  CAR_REPAIR: 'car_repair',
  CAR_WASH: 'car_wash',
  CASINO: 'casino',
  CEMETERY: 'cemetery',
  CHURCH: 'church',
  CITY_HALL: 'city_hall',
  CLOTHING_STORE: 'clothing_store',
  CONVENIENCE_STORE: 'convenience_store',
  COURTHOUSE: 'courthouse',
  DENTIST: 'dentist',
  DEPARTMENT_STORE: 'department_store',
  DOCTOR: 'doctor',
  DRUGSTORE: 'drugstore',
  ELECTRICIAN: 'electrician',
  ELECTRONICS_STORE: 'electronics_store',
  EMBASSY: 'embassy',
  FIRE_STATION: 'fire_station',
  FLORIST: 'florist',
  FUNERAL_HOME: 'funeral_home',
  FURNITURE_STORE: 'furniture_store',
  GAS_STATION: 'gas_station',
  GYM: 'gym',
  HAIR_CARE: 'hair_care',
  HARDWARE_STORE: 'hardware_store',
  HINDU_TEMPLE: 'hindu_temple',
  HOME_GOODS_STORE: 'home_goods_store',
  HOSPITAL: 'hospital',
  INSURANCE_AGENCY: 'insurance_agency',
  JEWELRY_STORE: 'jewelry_store',
  LAUNDRY: 'laundry',
  LAWYER: 'lawyer',
  LIBRARY: 'library',
  LIGHT_RAIL_STATION: 'light_rail_station',
  LIQUOR_STORE: 'liquor_store',
  LOCAL_GOVERNMENT_OFFICE: 'local_government_office',
  LOCKSMITH: 'locksmith',
  LODGING: 'lodging',
  MEAL_DELIVERY: 'meal_delivery',
  MEAL_TAKEAWAY: 'meal_takeaway',
  MOSQUE: 'mosque',
  MOVIE_RENTAL: 'movie_rental',
  MOVIE_THEATER: 'movie_theater',
  MOVING_COMPANY: 'moving_company',
  MUSEUM: 'museum',
  NIGHT_CLUB: 'night_club',
  PAINTER: 'painter',
  PARK: 'park',
  PARKING: 'parking',
  PET_STORE: 'pet_store',
  PHARMACY: 'pharmacy',
  PHYSIOTHERAPIST: 'physiotherapist',
  PLUMBER: 'plumber',
  POLICE: 'police',
  POST_OFFICE: 'post_office',
  PRIMARY_SCHOOL: 'primary_school',
  REAL_ESTATE_AGENCY: 'real_estate_agency',
  RESTAURANT: 'restaurant',
  ROOFING_CONTRACTOR: 'roofing_contractor',
  RV_PARK: 'rv_park',
  SCHOOL: 'school',
  SECONDARY_SCHOOL: 'secondary_school',
  SHOE_STORE: 'shoe_store',
  SHOPPING_MALL: 'shopping_mall',
  SPA: 'spa',
  STADIUM: 'stadium',
  STORAGE: 'storage',
  STORE: 'store',
  SUBWAY_STATION: 'subway_station',
  SUPERMARKET: 'supermarket',
  SYNAGOGUE: 'synagogue',
  TAXI_STAND: 'taxi_stand',
  TOURIST_ATTRACTION: 'tourist_attraction',
  TRAIN_STATION: 'train_station',
  TRANSIT_STATION: 'transit_station',
  TRAVEL_AGENCY: 'travel_agency',
  UNIVERSITY: 'university',
  VETERINARY_CARE: 'veterinary_care',
  ZOO: 'zoo',
};

const LOCATION_TYPE_LABEL = {
  [LOCATION_TYPE.ANY]: 'Any',
  [LOCATION_TYPE.ACCOUNTING]: 'Accounting',
  [LOCATION_TYPE.AIRPORT]: 'Airport',
  [LOCATION_TYPE.AMUSEMENT_PARK]: 'Amusement Park',
  [LOCATION_TYPE.AQUARIUM]: 'Aquarium',
  [LOCATION_TYPE.ART_GALLERY]: 'Art Gallery',
  [LOCATION_TYPE.ATM]: 'Atm',
  [LOCATION_TYPE.BAKERY]: 'Bakery',
  [LOCATION_TYPE.BANK]: 'Bank',
  [LOCATION_TYPE.BAR]: 'Bar',
  [LOCATION_TYPE.BEAUTY_SALON]: 'Beauty Salon',
  [LOCATION_TYPE.BICYCLE_STORE]: 'Bicycle Store',
  [LOCATION_TYPE.BOOK_STORE]: 'Book Store',
  [LOCATION_TYPE.BOWLING_ALLEY]: 'Bowling Alley',
  [LOCATION_TYPE.BUS_STATION]: 'Bus Station',
  [LOCATION_TYPE.CAFE]: 'Cafe',
  [LOCATION_TYPE.CAMPGROUND]: 'Campground',
  [LOCATION_TYPE.CAR_DEALER]: 'Car Dealer',
  [LOCATION_TYPE.CAR_RENTAL]: 'Car Rental',
  [LOCATION_TYPE.CAR_REPAIR]: 'Car Repair',
  [LOCATION_TYPE.CAR_WASH]: 'Car Wash',
  [LOCATION_TYPE.CASINO]: 'Casino',
  [LOCATION_TYPE.CEMETERY]: 'Cemetery',
  [LOCATION_TYPE.CHURCH]: 'Church',
  [LOCATION_TYPE.CITY_HALL]: 'City Hall',
  [LOCATION_TYPE.CLOTHING_STORE]: 'Clothing Store',
  [LOCATION_TYPE.CONVENIENCE_STORE]: 'Convenience Store',
  [LOCATION_TYPE.COURTHOUSE]: 'Courthouse',
  [LOCATION_TYPE.DENTIST]: 'Dentist',
  [LOCATION_TYPE.DEPARTMENT_STORE]: 'Department Store',
  [LOCATION_TYPE.DOCTOR]: 'Doctor',
  [LOCATION_TYPE.DRUGSTORE]: 'Drugstore',
  [LOCATION_TYPE.ELECTRICIAN]: 'Electrician',
  [LOCATION_TYPE.ELECTRONICS_STORE]: 'Electronics Store',
  [LOCATION_TYPE.EMBASSY]: 'Embassy',
  [LOCATION_TYPE.FIRE_STATION]: 'Fire Station',
  [LOCATION_TYPE.FLORIST]: 'Florist',
  [LOCATION_TYPE.FUNERAL_HOME]: 'Funeral Home',
  [LOCATION_TYPE.FURNITURE_STORE]: 'Furniture Store',
  [LOCATION_TYPE.GAS_STATION]: 'Gas Station',
  [LOCATION_TYPE.GYM]: 'Gym',
  [LOCATION_TYPE.HAIR_CARE]: 'Hair Care',
  [LOCATION_TYPE.HARDWARE_STORE]: 'Hardware Store',
  [LOCATION_TYPE.HINDU_TEMPLE]: 'Hindu Temple',
  [LOCATION_TYPE.HOME_GOODS_STORE]: 'Home Goods Store',
  [LOCATION_TYPE.HOSPITAL]: 'Hospital',
  [LOCATION_TYPE.INSURANCE_AGENCY]: 'Insurance Agency',
  [LOCATION_TYPE.JEWELRY_STORE]: 'Jewelry Store',
  [LOCATION_TYPE.LAUNDRY]: 'Laundry',
  [LOCATION_TYPE.LAWYER]: 'Lawyer',
  [LOCATION_TYPE.LIBRARY]: 'Library',
  [LOCATION_TYPE.LIGHT_RAIL_STATION]: 'Light Rail Station',
  [LOCATION_TYPE.LIQUOR_STORE]: 'Liquor Store',
  [LOCATION_TYPE.LOCAL_GOVERNMENT_OFFICE]: 'Local Government Office',
  [LOCATION_TYPE.LOCKSMITH]: 'Locksmith',
  [LOCATION_TYPE.LODGING]: 'Lodging',
  [LOCATION_TYPE.MEAL_DELIVERY]: 'Meal Delivery',
  [LOCATION_TYPE.MEAL_TAKEAWAY]: 'Meal Takeaway',
  [LOCATION_TYPE.MOSQUE]: 'Mosque',
  [LOCATION_TYPE.MOVIE_RENTAL]: 'Movie Rental',
  [LOCATION_TYPE.MOVIE_THEATER]: 'Movie Theater',
  [LOCATION_TYPE.MOVING_COMPANY]: 'Moving Company',
  [LOCATION_TYPE.MUSEUM]: 'Museum',
  [LOCATION_TYPE.NIGHT_CLUB]: 'Night Club',
  [LOCATION_TYPE.PAINTER]: 'Painter',
  [LOCATION_TYPE.PARK]: 'Park',
  [LOCATION_TYPE.PARKING]: 'Parking',
  [LOCATION_TYPE.PET_STORE]: 'Pet Store',
  [LOCATION_TYPE.PHARMACY]: 'Pharmacy',
  [LOCATION_TYPE.PHYSIOTHERAPIST]: 'Physiotherapist',
  [LOCATION_TYPE.PLUMBER]: 'Plumber',
  [LOCATION_TYPE.POLICE]: 'Police',
  [LOCATION_TYPE.POST_OFFICE]: 'Post Office',
  [LOCATION_TYPE.PRIMARY_SCHOOL]: 'Primary School',
  [LOCATION_TYPE.REAL_ESTATE_AGENCY]: 'Real Estate Agency',
  [LOCATION_TYPE.RESTAURANT]: 'Restaurant',
  [LOCATION_TYPE.ROOFING_CONTRACTOR]: 'Roofing Contractor',
  [LOCATION_TYPE.RV_PARK]: 'Rv Park',
  [LOCATION_TYPE.SCHOOL]: 'School',
  [LOCATION_TYPE.SECONDARY_SCHOOL]: 'Secondary School',
  [LOCATION_TYPE.SHOE_STORE]: 'Shoe Store',
  [LOCATION_TYPE.SHOPPING_MALL]: 'Shopping Mall',
  [LOCATION_TYPE.SPA]: 'Spa',
  [LOCATION_TYPE.STADIUM]: 'Stadium',
  [LOCATION_TYPE.STORAGE]: 'Storage',
  [LOCATION_TYPE.STORE]: 'Store',
  [LOCATION_TYPE.SUBWAY_STATION]: 'Subway Station',
  [LOCATION_TYPE.SUPERMARKET]: 'Supermarket',
  [LOCATION_TYPE.SYNAGOGUE]: 'Synagogue',
  [LOCATION_TYPE.TAXI_STAND]: 'Taxi Stand',
  [LOCATION_TYPE.TOURIST_ATTRACTION]: 'Tourist Attraction',
  [LOCATION_TYPE.TRAIN_STATION]: 'Train Station',
  [LOCATION_TYPE.TRANSIT_STATION]: 'Transit Station',
  [LOCATION_TYPE.TRAVEL_AGENCY]: 'Travel Agency',
  [LOCATION_TYPE.UNIVERSITY]: 'University',
  [LOCATION_TYPE.VETERINARY_CARE]: 'Veterinary Care',
  [LOCATION_TYPE.ZOO]: 'Zoo',
};

const LOCATION_TYPES = Object.values(LOCATION_TYPE);

const ALGORITHM_TYPE = {
  MEDIAN: 'MEDIAN',
  MEAN: 'MEAN'
};

const ALGORITHM_TYPE_LABEL = {
  [ALGORITHM_TYPE.MEDIAN]: 'Geometric median',
  [ALGORITHM_TYPE.MEAN]: 'Center of mass'
};

const ALGORITHM_TYPES = Object.values(ALGORITHM_TYPE);

const AutoFindVenueModal = ({ open, onClose, onSave, translate: __ }) => {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);

  const [type, setType] = useState(LOCATION_TYPE.ANY);
  const [radius, setRadius] = useState(50);
  const [algorithm, setAlgorithm] = useState(ALGORITHM_TYPE.MEDIAN);

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{__('Auto find venue settings')}</DialogTitle>
      <DialogContent>
        <Content container direction="column">
          <Grid container alignItems="center">
            <TextField
              type="number"
              variant="outlined"
              label={__('Search radius')}
              value={radius}
              style={{ marginRight: 15 }}
              onChange={event => {
                setRadius(Math.min(Math.max(event.target.value, 10), 1000));
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">{__('m')}</InputAdornment>,
              }}
            />
            <Autocomplete
              disableClearable
              value={type}
              options={LOCATION_TYPES}
              getOptionLabel={(option) => __(LOCATION_TYPE_LABEL[option])}
              style={{ width: 300 }}
              onChange={(e, value) => {
                setType(value);
              }}
              renderInput={(params) => (
                <TextField {...params} label={__('Location type')} variant="outlined" />
              )}
            />
            <Autocomplete
              disableClearable
              value={algorithm}
              options={ALGORITHM_TYPES}
              getOptionLabel={(option) => __(ALGORITHM_TYPE_LABEL[option])}
              style={{ width: 200, marginTop: 15 }}
              onChange={(e, value) => {
                setAlgorithm(value);
              }}
              renderInput={(params) => (
                <TextField {...params} label={__('Algorithm')} variant="outlined" />
              )}
            />
          </Grid>
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
                onSave({ type: type === LOCATION_TYPE.ANY ? null : type, radius, algorithm });
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

export default withSettings(AutoFindVenueModal);