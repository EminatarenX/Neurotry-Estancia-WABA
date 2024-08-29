import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
    FACEBOOK_API_TOKEN: string;
    SECRET_WPP_TOKEN: string;
    FACEBOOK_API_URL: string;
    FACEBOOK_PRIVATE_KEY: string;
    FACEBOOK_PHRASE_PRIVATE_KEY: string;
    PORT: number;
    STRIPE_SECRET_KEY: string;
    STRIPE_SECRET_ENDPOINT: string;
}

const envsScheme = joi.object({
    APP_SECRET: joi.string().required(),
    FACEBOOK_PRIVATE_KEY: joi.string().required(),
    SECRET_WPP_TOKEN: joi.string().required(),
    FACEBOOK_API_URL: joi.string().required(),
    FACEBOOK_API_TOKEN: joi.string().required(),
    PORT: joi.number().required(),
    STRIPE_SECRET_KEY: joi.string().required(),
    STRIPE_SECRET_ENDPOINT: joi.string().required()
})
.unknown()

const { error, value } = envsScheme.validate(process.env );

if( error ) {
    throw new Error(`Config validation error: ${error.message}`)
}

const env: EnvVars = value;

export const envs = {
    // Facebook API
    FACEBOOK_API_TOKEN: env.FACEBOOK_API_TOKEN,
    SECRET_WPP_TOKEN: env.SECRET_WPP_TOKEN,
    FACEBOOK_API_URL: env.FACEBOOK_API_URL,
    FACEBOOK_PHRASE_PRIVATE_KEY: env.FACEBOOK_PHRASE_PRIVATE_KEY,
    FACEBOOK_PRIVATE_KEY: env.FACEBOOK_PRIVATE_KEY,

    
    PORT: env.PORT,
    stripeSecret: env.STRIPE_SECRET_KEY,
    stripeSecretEndpoint: env.STRIPE_SECRET_ENDPOINT
}