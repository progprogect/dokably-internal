import Loading from "@shared/common/Loading";
import { Suspense } from "react";
import { Outlet as OutletPrimitive } from "react-router-dom";


function Outlet() {
  return (
    <Suspense fallback={<Loading />}>
      <OutletPrimitive />
    </Suspense>
  )
}

export default Outlet