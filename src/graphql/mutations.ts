import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserDto!) {
    register(input: $input) {
      success
      message
      data {
        userId
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($input: LoginDto!) {
    login(input: $input) {
        success
        message
        data {
        accessToken
        }
    }  
  }
`;