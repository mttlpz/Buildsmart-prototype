import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const formFields = [
  {
    id: "company-name",
    label: "Company Name",
    required: true,
    defaultValue: "Buildsmart Inc.",
    wrapperClassName: "col-span-1",
  },
  {
    id: "office-phone-number",
    label: "Office Phone Number",
    required: true,
    defaultValue: "(+63) 967 387 1977",
    wrapperClassName: "col-span-1",
  },
  {
    id: "company-address",
    label: "Company Address",
    required: true,
    defaultValue: "Fairview 123",
    wrapperClassName: "col-span-2",
  },
  {
    id: "city-municipality",
    label: "City / Municipality",
    required: true,
    defaultValue: "City",
    wrapperClassName: "col-span-1",
  },
  {
    id: "province-region",
    label: "Province / Region",
    required: true,
    defaultValue: "Province",
    wrapperClassName: "col-span-1",
  },
];

export const SignUp = (): JSX.Element => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(320px,43%)_1fr]">
        <aside className="relative hidden lg:flex items-center justify-center overflow-hidden bg-[linear-gradient(90deg,rgba(180,30,23,1)_0%,rgba(236,77,12,1)_100%)] shadow-[inset_0px_4px_50px_#0000001a]">
          <img
            className="h-auto w-[55%] max-w-[458px]"
            alt="Logo"
            src="/figmaAssets/logo.svg"
          />
        </aside>
        <section className="relative flex items-center justify-center bg-[linear-gradient(180deg,rgba(235,135,108,0.49)_0%,rgba(133,76,61,0)_100%)] px-4 py-6 sm:px-6 lg:px-10">
          <Card className="w-full max-w-[1021px] rounded-[10px] border-0 bg-white shadow-[0px_4px_20px_#00000040]">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <header className="mb-7">
                <h1 className="[font-family:'Belanosima',Helvetica] text-center text-[32px] font-normal leading-none tracking-[0] text-black sm:text-[40px] lg:text-[49.5px]">
                  WELCOME TO BUILDSMART!
                </h1>
              </header>
              <div className="mb-9 h-px w-full">
                <img
                  className="h-px w-full"
                  alt="Line"
                  src="/figmaAssets/line-2.svg"
                />
              </div>
              <section className="mx-auto w-full max-w-[912px]">
                <button
                  type="button"
                  className="mb-10 flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-black bg-[#eedcd8] px-4 py-8 text-center"
                >
                  <img
                    className="mb-4 h-[83px] w-[93px]"
                    alt="Image"
                    src="/figmaAssets/image.png"
                  />
                  <span className="[font-family:'Poppins',Helvetica] text-[24px] font-medium leading-normal tracking-[0] text-black sm:text-[31.3px]">
                    Upload Company Logo
                  </span>
                  <span className="[font-family:'Poppins',Helvetica] text-[12px] font-light leading-normal tracking-[0] text-black sm:text-[15.3px]">
                    PNG, JPG, up to 5MB
                  </span>
                </button>
                <form className="grid grid-cols-1 gap-x-9 gap-y-6 md:grid-cols-2">
                  {formFields.map((field) => (
                    <div key={field.id} className={field.wrapperClassName}>
                      <label
                        htmlFor={field.id}
                        className="mb-2 block [font-family:'Belanosima',Helvetica] text-[24px] font-normal leading-none tracking-[0] text-[#070707] sm:text-[32px]"
                      >
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-[#ff0000]">*</span>
                        )}
                      </label>
                      <Input
                        id={field.id}
                        defaultValue={field.defaultValue}
                        className="h-14 rounded-[6px] border-black bg-white px-4 [font-family:'Poppins',Helvetica] text-xl font-medium tracking-[0] text-neutral-400 placeholder:text-neutral-400 sm:h-[65px] sm:text-2xl"
                      />
                    </div>
                  ))}
                </form>
              </section>
              <div className="mt-8 h-px w-full">
                <img
                  className="h-px w-full"
                  alt="Line"
                  src="/figmaAssets/line-2.svg"
                />
              </div>
              <footer className="mt-3 flex justify-end">
                <Button
                  type="button"
                  className="h-auto min-w-[177px] rounded-[2px] border-0 bg-[url(/figmaAssets/group-214.png)] bg-[length:100%_100%] bg-center bg-no-repeat px-6 py-4 [font-family:'Poppins',Helvetica] text-base font-medium tracking-[0] text-white shadow-none hover:opacity-95"
                >
                  <span>Continue</span>
                  <img
                    className="ml-3 h-4 w-4"
                    alt="Vector"
                    src="/figmaAssets/vector.svg"
                  />
                </Button>
              </footer>
            </CardContent>
          </Card>
          <img
            className="pointer-events-none absolute bottom-[30.5%] right-[23.5%] hidden h-[26px] w-[26px] xl:block"
            alt="Multiply"
            src="/figmaAssets/multiply.png"
          />
        </section>
      </section>
    </main>
  );
};
