import { toast } from 'react-toastify';
import { toastSuccess, toastError, toastInfo, toastWarning } from '../../utils/toast';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockedToast = toast as jest.Mocked<typeof toast>;

describe('Toast Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toastSuccess', () => {
    test('calls toast.success with correct message', () => {
      const message = 'Operation completed successfully!';
      toastSuccess(message);

      expect(mockedToast.success).toHaveBeenCalledWith(message);
      expect(mockedToast.success).toHaveBeenCalledTimes(1);
    });

    test('handles empty message', () => {
      toastSuccess('');
      expect(mockedToast.success).toHaveBeenCalledWith('');
    });

    test('handles special characters in message', () => {
      const message = 'Success! 🎉 Special chars: @#$%^&*()';
      toastSuccess(message);
      expect(mockedToast.success).toHaveBeenCalledWith(message);
    });
  });

  describe('toastError', () => {
    test('calls toast.error with correct message', () => {
      const message = 'An error occurred!';
      toastError(message);

      expect(mockedToast.error).toHaveBeenCalledWith(message);
      expect(mockedToast.error).toHaveBeenCalledTimes(1);
    });

    test('handles multiline error messages', () => {
      const message = 'Error occurred:\nLine 1\nLine 2';
      toastError(message);
      expect(mockedToast.error).toHaveBeenCalledWith(message);
    });
  });

  describe('toastInfo', () => {
    test('calls toast.info with correct message', () => {
      const message = 'Information message';
      toastInfo(message);

      expect(mockedToast.info).toHaveBeenCalledWith(message);
      expect(mockedToast.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('toastWarning', () => {
    test('calls toast.warning with correct message', () => {
      const message = 'Warning message';
      toastWarning(message);

      expect(mockedToast.warning).toHaveBeenCalledWith(message);
      expect(mockedToast.warning).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple toast calls', () => {
    test('handles multiple consecutive calls', () => {
      toastSuccess('Success 1');
      toastError('Error 1');
      toastInfo('Info 1');
      toastWarning('Warning 1');

      expect(mockedToast.success).toHaveBeenCalledTimes(1);
      expect(mockedToast.error).toHaveBeenCalledTimes(1);
      expect(mockedToast.info).toHaveBeenCalledTimes(1);
      expect(mockedToast.warning).toHaveBeenCalledTimes(1);
    });

    test('handles rapid succession calls', () => {
      for (let i = 0; i < 5; i++) {
        toastSuccess(`Success ${i}`);
      }

      expect(mockedToast.success).toHaveBeenCalledTimes(5);
    });
  });
});
