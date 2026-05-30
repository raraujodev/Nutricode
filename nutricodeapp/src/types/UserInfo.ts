export type Sexo = "MALE" | "FEMALE";

export type UpdateUserInfoDTO = {
  height?: number;
  birthDate?: string;
  sex?: Sexo;
};