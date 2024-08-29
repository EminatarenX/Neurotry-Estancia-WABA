import { v2 } from 'cloudinary';
import { CLOUDINARY } from './constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: 'dlgusambk',
      api_key: '943321515132595',
      api_secret: 'LKUIVvMVINoZgo-HHYZqCWt2ylQ',
    });
  },
};