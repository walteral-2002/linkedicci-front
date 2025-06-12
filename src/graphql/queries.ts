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

export const GET_USER_APPLICATIONS = gql`
  query getApplicationsByStudent { 
    getApplicationsByStudent { 
      success 
      message 
      data { 
        id 
        offerId 
        studentId 
        message 
        status 
        createdAt 
      } 
    } 
  }
`;

export const GET_APPLICANTS_BY_OFFER = gql`
  query GetApplicants($offerId: String!) { 
    getApplicantsByOffer(offerId: $offerId) { 
      success 
      message 
      data { 
        id 
        offerId 
        studentId 
        message 
        status 
        createdAt 
      } 
    } 
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUser($id: String!){
    getUser(id: $id){
      success
      message
      data{
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_CV_BY_USER_ID = gql`
  query GetCv($userId: String!) { 
    getCv(userId: $userId) { 
      userId 
      name 
      description 
      career 
      email 
      phone 
      projects { 
        id 
        name 
        url 
        description 
      } 
      skills { 
        id 
        name 
        rate 
      } 
    } 
  }
`;