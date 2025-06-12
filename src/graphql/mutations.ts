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

export const CREATE_APPLICATION = gql`
mutation CreateOffer($input: CreateOfferDto!) {
  createOffer(input: $input) {
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

export const APPLY_TO_OFFER = gql`
  mutation ApplyToOffer($input: ApplyToOfferDto!) { 
    applyToOffer(input: $input) { 
      success 
      message 
      data { 
        id 
        title 
        description 
        company 
        location 
        salary 
        isInternship 
        createdByHeadOfCareerId 
        createdAt 
        updatedAt 
      } 
    } 
  }
`;

export const DECIDE_APPLICATION = gql`
  mutation UpdateStatus($input: UpdateApplicationStatusDto!) { 
    updateApplicationStatus(input: $input) { 
      success 
      message 
    } 
  }
`;

export const CREATE_CV = gql`
  mutation CreateCv($input: CreateCvInput!){
    createCv(input: $input){
      userId
      name
      description
      career
      email
      phone
      projects{
        id
        name
        url
        description
      }
      skills{
        id
        name
        rate
      }
    }
  }
`;

export const UPDATE_CV = gql`
  mutation UpdateCv($input: CreateCvInput!){
    updateCv(input: $input){
      userId
      name
      description
      career
      email
      phone
      projects{
        id
        name
        url
        description
      }
      skills{
        id
        name
        rate
      }
    }
  }
`;