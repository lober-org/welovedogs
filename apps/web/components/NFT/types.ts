export type TokenAttribute = {
  trait_type: string;
  value: string;
};

export type TokenMetadata = {
  name: string;
  description: string;
  image: string;
  attributes?: TokenAttribute[];
  external_url?: string;
};
