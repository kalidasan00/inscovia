// lib/locationUtils.js
// Place this file in: frontend/lib/locationUtils.js

import statesData from '../public/india-states-districts.json';

/**
 * Get all states
 * @returns {Array} Array of state objects
 */
export const getAllStates = () => {
  return statesData.states;
};

/**
 * Get all state names
 * @returns {Array} Array of state names
 */
export const getStateNames = () => {
  return statesData.states.map(state => state.name);
};

/**
 * Get districts for a specific state
 * @param {string} stateName - Name of the state
 * @returns {Array} Array of district names
 */
export const getDistrictsByState = (stateName) => {
  const state = statesData.states.find(s => s.name === stateName);
  return state ? state.districts : [];
};

/**
 * Get state by ID
 * @param {number} stateId - ID of the state
 * @returns {Object|null} State object or null
 */
export const getStateById = (stateId) => {
  return statesData.states.find(s => s.id === stateId) || null;
};

/**
 * Search states by name
 * @param {string} query - Search query
 * @returns {Array} Array of matching states
 */
export const searchStates = (query) => {
  const lowerQuery = query.toLowerCase();
  return statesData.states.filter(state =>
    state.name.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Search districts across all states
 * @param {string} query - Search query
 * @returns {Array} Array of objects with state and district info
 */
export const searchDistricts = (query) => {
  const lowerQuery = query.toLowerCase();
  const results = [];

  statesData.states.forEach(state => {
    state.districts.forEach(district => {
      if (district.toLowerCase().includes(lowerQuery)) {
        results.push({
          state: state.name,
          district: district,
          stateId: state.id
        });
      }
    });
  });

  return results;
};

/**
 * Get total number of districts in a state
 * @param {string} stateName - Name of the state
 * @returns {number} Number of districts
 */
export const getDistrictCount = (stateName) => {
  const state = statesData.states.find(s => s.name === stateName);
  return state ? state.districts.length : 0;
};

/**
 * Validate if a district exists in a state
 * @param {string} stateName - Name of the state
 * @param {string} districtName - Name of the district
 * @returns {boolean} True if district exists in the state
 */
export const isValidDistrict = (stateName, districtName) => {
  const state = statesData.states.find(s => s.name === stateName);
  if (!state) return false;
  return state.districts.includes(districtName);
};

/**
 * Get statistics about states and districts
 * @returns {Object} Statistics object
 */
export const getStatistics = () => {
  const totalStates = statesData.states.length;
  const totalDistricts = statesData.states.reduce((sum, state) => sum + state.districts.length, 0);
  const avgDistrictsPerState = (totalDistricts / totalStates).toFixed(2);

  const stateWithMostDistricts = statesData.states.reduce((max, state) =>
    state.districts.length > max.districts.length ? state : max
  );

  const stateWithLeastDistricts = statesData.states.reduce((min, state) =>
    state.districts.length < min.districts.length ? state : min
  );

  return {
    totalStates,
    totalDistricts,
    avgDistrictsPerState,
    stateWithMostDistricts: {
      name: stateWithMostDistricts.name,
      count: stateWithMostDistricts.districts.length
    },
    stateWithLeastDistricts: {
      name: stateWithLeastDistricts.name,
      count: stateWithLeastDistricts.districts.length
    }
  };
};

export default {
  getAllStates,
  getStateNames,
  getDistrictsByState,
  getStateById,
  searchStates,
  searchDistricts,
  getDistrictCount,
  isValidDistrict,
  getStatistics
};