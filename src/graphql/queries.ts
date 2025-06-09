import { gql } from '@apollo/client';

export const GET_USER_INFO = gql`
    query GetUserProfile {
        getUserProfile { 
        success
        message
        data { 
        id
        name
        email
        role
        } 
    }
  } 
`;

export const GET_APPLICATIONS = gql`
  query Offers{ 
    offers { 
      success 
      message 
      data { 
        id 
        title 
        description 
        company 
        location 
        salary 
        createdByHeadOfCareerId 
        isInternship 
        createdAt 
        updatedAt 
      } 
    } 
  }
`;

export const GET_OFFER_BY_ID = gql`
  query GetOffer($id: String!) {
    offer(id: $id) {
      success
      message
      data {
        id
        title
        description
        company
        location
        salary
        createdByHeadOfCareerId
        isInternship
        createdAt
        updatedAt
      }
    }
  }
`;