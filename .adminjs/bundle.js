(function (React) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // src/admin/components/ImageRenderer.jsx
  const ImageRenderer = props => {
    const {
      record,
      property
    } = props;
    const imageUrl = record.params[property.name];
    const [error, setError] = React.useState(null);
    const handleError = () => {
      setError('Failed to load image. It may be blocked by security policies or invalid.');
    };
    if (!imageUrl) {
      return /*#__PURE__*/React__default.default.createElement("span", null, "No image available");
    }
    return /*#__PURE__*/React__default.default.createElement("div", null, error ? /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        color: 'red'
      }
    }, error) : /*#__PURE__*/React__default.default.createElement("img", {
      src: imageUrl,
      alt: "Proof",
      style: {
        maxWidth: '200px'
      },
      onError: handleError
    }));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.ImageRenderer = ImageRenderer;

})(React);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyLmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHNyYy9hZG1pbi9jb21wb25lbnRzL0ltYWdlUmVuZGVyZXIuanN4XG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IEltYWdlUmVuZGVyZXIgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQsIHByb3BlcnR5IH0gPSBwcm9wcztcbiAgY29uc3QgaW1hZ2VVcmwgPSByZWNvcmQucGFyYW1zW3Byb3BlcnR5Lm5hbWVdO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuXG4gIGNvbnN0IGhhbmRsZUVycm9yID0gKCkgPT4ge1xuICAgIHNldEVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZS4gSXQgbWF5IGJlIGJsb2NrZWQgYnkgc2VjdXJpdHkgcG9saWNpZXMgb3IgaW52YWxpZC4nKTtcbiAgfTtcblxuICBpZiAoIWltYWdlVXJsKSB7XG4gICAgcmV0dXJuIDxzcGFuPk5vIGltYWdlIGF2YWlsYWJsZTwvc3Bhbj47XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICB7ZXJyb3IgPyAoXG4gICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAncmVkJyB9fT57ZXJyb3J9PC9zcGFuPlxuICAgICAgKSA6IChcbiAgICAgICAgPGltZ1xuICAgICAgICAgIHNyYz17aW1hZ2VVcmx9XG4gICAgICAgICAgYWx0PVwiUHJvb2ZcIlxuICAgICAgICAgIHN0eWxlPXt7IG1heFdpZHRoOiAnMjAwcHgnIH19XG4gICAgICAgICAgb25FcnJvcj17aGFuZGxlRXJyb3J9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VSZW5kZXJlcjsiLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBJbWFnZVJlbmRlcmVyIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0ltYWdlUmVuZGVyZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkltYWdlUmVuZGVyZXIgPSBJbWFnZVJlbmRlcmVyIl0sIm5hbWVzIjpbIkltYWdlUmVuZGVyZXIiLCJwcm9wcyIsInJlY29yZCIsInByb3BlcnR5IiwiaW1hZ2VVcmwiLCJwYXJhbXMiLCJuYW1lIiwiZXJyb3IiLCJzZXRFcnJvciIsInVzZVN0YXRlIiwiaGFuZGxlRXJyb3IiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImNvbG9yIiwic3JjIiwiYWx0IiwibWF4V2lkdGgiLCJvbkVycm9yIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBQUE7RUFHQSxNQUFNQSxhQUFhLEdBQUlDLEtBQUssSUFBSztJQUMvQixNQUFNO01BQUVDLE1BQU07RUFBRUMsSUFBQUE7RUFBUyxHQUFDLEdBQUdGLEtBQUs7SUFDbEMsTUFBTUcsUUFBUSxHQUFHRixNQUFNLENBQUNHLE1BQU0sQ0FBQ0YsUUFBUSxDQUFDRyxJQUFJLENBQUM7SUFDN0MsTUFBTSxDQUFDQyxLQUFLLEVBQUVDLFFBQVEsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDO0lBRXhDLE1BQU1DLFdBQVcsR0FBR0EsTUFBTTtNQUN4QkYsUUFBUSxDQUFDLDBFQUEwRSxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxDQUFDSixRQUFRLEVBQUU7RUFDYixJQUFBLG9CQUFPTyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBLElBQUEsRUFBTSxvQkFBd0IsQ0FBQztFQUN4QztJQUVBLG9CQUNFRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsRUFDR0wsS0FBSyxnQkFDSkksc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQTtFQUFNQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsS0FBSyxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQUVQLEtBQVksQ0FBQyxnQkFFN0NJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFDRUcsSUFBQUEsR0FBRyxFQUFFWCxRQUFTO0VBQ2RZLElBQUFBLEdBQUcsRUFBQyxPQUFPO0VBQ1hILElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxRQUFRLEVBQUU7T0FBVTtFQUM3QkMsSUFBQUEsT0FBTyxFQUFFUjtFQUFZLEdBQ3RCLENBRUEsQ0FBQztFQUVWLENBQUM7O0VDOUJEUyxPQUFPLENBQUNDLGNBQWMsR0FBRyxFQUFFO0VBRTNCRCxPQUFPLENBQUNDLGNBQWMsQ0FBQ3BCLGFBQWEsR0FBR0EsYUFBYTs7Ozs7OyJ9
