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