type Failure<E> = {
  status: "failure";
  error: E;
};

type Success<D> = {
  status: "success";
  data: D;
};

type Result<E, D> = Failure<E> | Success<D>;

const isSuccess = <E, A>(result: Result<E, A>): result is Success<A> =>
  result.status === "success";

const isFailure = <E, A>(result: Result<E, A>): result is Failure<E> =>
  result.status === "failure";

const toSuccess = <E = never, D = never>(data: D): Result<E, D> => ({
  status: "success",
  data,
});

const toFailure = <E = never, D = never>(error: E): Result<E, D> => ({
  status: "failure",
  error,
});

export { Result, isSuccess, isFailure, toSuccess, toFailure };
